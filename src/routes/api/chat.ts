import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "@/lib/ai/run-id";

const SYSTEM = `Você é o FinControl AI, um assistente financeiro pessoal brasileiro, claro e prático.
Responda sempre em português do Brasil, em markdown curto (listas e negrito; nunca use tabelas).
Use os dados financeiros reais do usuário fornecidos abaixo para analisar gastos, apontar padrões,
sugerir economias concretas (com valores em R$) e propor metas. Para dúvidas gerais de finanças,
explique de forma didática. Não invente dados que não estão no resumo. Não é recomendação formal de investimento.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return Response.json({ error: "Assistente não configurado." }, { status: 500 });

        const body = (await request.json()) as { messages?: { role: string; content: string }[]; context?: string };
        const messages: ModelMessage[] = (body.messages ?? [])
          .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-20)
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 4000) }));
        if (!messages.length) return Response.json({ error: "Mensagem vazia." }, { status: 400 });

        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });

        let upstreamError: string | null = null;
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          system: `${SYSTEM}\n\nDADOS DO USUÁRIO:\n${(body.context ?? "").slice(0, 6000)}`,
          messages,
          abortSignal: request.signal,
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
          onError: ({ error }) => {
            const status = (error as { statusCode?: number })?.statusCode;
            upstreamError =
              status === 429 ? "Muitas solicitações. Aguarde um instante." :
              status === 402 || status === 403 ? "Créditos de IA indisponíveis no momento." :
              "Não foi possível responder agora.";
            console.error("chat error", error);
          },
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.textStream) controller.enqueue(encoder.encode(chunk));
            } catch {
              /* handled below */
            }
            if (upstreamError) controller.enqueue(encoder.encode(`\n\n⚠️ ${upstreamError}`));
            controller.close();
          },
        });
        return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
