import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { financialSummary, goalsQuery, transactionsQuery } from "@/lib/finance";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente com IA · FinControl AI" },
      { name: "description", content: "Converse com uma IA que analisa seus gastos reais e sugere metas e economia." },
      { property: "og:title", content: "Assistente com IA · FinControl AI" },
      { property: "og:description", content: "Converse com uma IA que analisa seus gastos reais e sugere metas e economia." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(transactionsQuery), context.queryClient.ensureQueryData(goalsQuery)]),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Analise meus gastos e diga onde posso economizar",
  "Quanto devo guardar por mês para minhas metas?",
  "Qual a diferença entre CDB e Tesouro Direto?",
  "Sugira uma nova meta realista para mim",
];

function renderMd(text: string) {
  return text.split("\n").map((line, i) => {
    const html = line
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^#{1,4}\s(.+)/, "<strong>$1</strong>");
    const bullet = /^\s*[-*]\s/.test(line);
    return <p key={i} className={bullet ? "pl-4 -indent-3" : "min-h-3"} dangerouslySetInnerHTML={{ __html: bullet ? "• " + html.replace(/^\s*[-*]\s/, "") : html }} />;
  });
}

function Assistant() {
  const { data: txs } = useSuspenseQuery(transactionsQuery);
  const { data: goals } = useSuspenseQuery(goalsQuery);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, context: financialSummary(txs, goals) }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Erro ao falar com o assistente." }));
        throw new Error(err.error);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        setMessages([...next, { role: "assistant", content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Assistente com IA" subtitle="Ele lê suas movimentações e metas para responder." />
      <section className="panel flex h-[calc(100vh-14rem)] min-h-[28rem] flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="mx-auto max-w-xl pt-6 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand font-display text-lg font-bold text-primary-foreground shadow-glow">R$</div>
              <h2 className="mt-4 text-lg font-semibold">Como posso ajudar suas finanças hoje?</h2>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-xl border border-border p-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
            ) : (
              <div key={i} className="max-w-[90%] space-y-1 text-sm leading-relaxed">
                {m.content ? renderMd(m.content) : <span className="animate-pulse text-muted-foreground">Analisando seus dados…</span>}
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
        <form
          className="flex items-end gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Pergunte sobre seus gastos, metas ou investimentos…"
            className="max-h-40 min-h-11 resize-none"
          />
          {loading ? (
            <Button type="button" size="icon" variant="secondary" onClick={() => abortRef.current?.abort()} aria-label="Parar"><Square /></Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Enviar"><ArrowUp /></Button>
          )}
        </form>
      </section>
    </>
  );
}
