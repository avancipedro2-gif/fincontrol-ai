# FinControl AI — Gestor Financeiro Inteligente

Aplicativo web de gestão financeira pessoal com seis módulos integrados e um assistente com IA que analisa os dados reais do usuário.

## Módulos

| Módulo | Rota | O que faz |
| --- | --- | --- |
| Dashboard | `/` | Saldo, receitas, despesas, taxa de poupança, fluxo mensal, gastos por categoria, últimas movimentações e metas |
| Receitas e Despesas | `/transacoes` | Cadastro, filtro e exclusão de movimentações por categoria |
| Simulador de Investimentos | `/investimentos` | Juros compostos com valor inicial, aporte mensal, taxa anual e prazo (com presets) |
| Metas Financeiras | `/metas` | Criação de metas, depósitos, progresso e valor mensal necessário até o prazo |
| Assistente com IA | `/assistente` | Chat em streaming que analisa gastos, responde dúvidas e sugere metas/economia |
| Relatórios | `/relatorios` | Gráficos comparativos, evolução do saldo, ranking de categorias e exportação CSV |

## Tecnologias

- React 19 + TypeScript (TanStack Start / Router / Query)
- Tailwind CSS v4 + componentes shadcn/ui
- Recharts (gráficos interativos)
- Supabase (via Lovable Cloud) — tabelas `transactions` e `goals`
- LLM via Lovable AI Gateway (Vercel AI SDK, modelo `openai/gpt-6-astra`)

## Estrutura

```
src/
  components/AppShell.tsx   # layout, navegação lateral/inferior, cards
  lib/finance.ts            # tipos, consultas, cálculos (totais, mensal, categorias, juros compostos)
  lib/finance.test.ts       # testes das regras de cálculo
  lib/ai/run-id.ts          # helper do gateway de IA
  routes/                   # uma rota por módulo + api/chat.ts (servidor do assistente)
  styles.css                # design system (tokens azul-marinho, azul e verde)
```

## Como rodar

```bash
bun install
bun run dev
bunx vitest run   # testes
```

## Observações

- Modo demonstração: sem login; os dados de exemplo são compartilhados entre visitantes.
- O assistente recebe um resumo das movimentações e metas e responde em português.
- Histórico de prompts em [`PROMPTS.md`](./PROMPTS.md).
