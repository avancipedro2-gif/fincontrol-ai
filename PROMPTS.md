# Histórico de prompts

## 1. Prompt inicial (27/10/2026)

> FinControl AI — Gestor Financeiro Inteligente
>
> Aplicativo com seis módulos integrados: Dashboard, Receitas e Despesas, Simulador de Investimentos, Metas Financeiras, Assistente com IA e Relatórios.
>
> Design: fintech premium, azul-marinho escuro, detalhes em azul e verde, gráficos interativos e interface responsiva.
>
> Tecnologias: React, TypeScript, Tailwind CSS, Recharts, Supabase e integração com LLM.
>
> Entrega acadêmica: código-fonte organizado, README, histórico de prompts e demonstração das telas.

## 2. Respostas às perguntas de esclarecimento

- Login: não, apenas demonstração
- Dados iniciais: sim, com dados de exemplo
- Assistente IA: analisar gastos reais, responder dúvidas financeiras, sugerir metas e economia
- Entrega: gerar README e histórico de prompts

## Prompt de sistema do assistente

Definido em `src/routes/api/chat.ts`: assistente financeiro brasileiro, responde em português, usa apenas os dados reais fornecidos, sugere economias com valores em R$ e não faz recomendação formal de investimento.
