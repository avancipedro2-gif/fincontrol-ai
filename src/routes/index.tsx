import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot } from "lucide-react";
import { PageHeader, Stat, tooltipStyle, CHART_COLORS } from "@/components/AppShell";
import { brl, byCategory, goalsQuery, monthly, totals, transactionsQuery } from "@/lib/finance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · FinControl AI" },
      { name: "description", content: "Visão geral do seu saldo, receitas, despesas e metas financeiras." },
      { property: "og:title", content: "Dashboard · FinControl AI" },
      { property: "og:description", content: "Visão geral do seu saldo, receitas, despesas e metas financeiras." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(transactionsQuery), context.queryClient.ensureQueryData(goalsQuery)]),
  component: Dashboard,
});

function Dashboard() {
  const { data: txs } = useSuspenseQuery(transactionsQuery);
  const { data: goals } = useSuspenseQuery(goalsQuery);
  const t = totals(txs);
  const months = monthly(txs);
  const cats = byCategory(txs);

  return (
    <>
      <PageHeader title="Olá, bem-vindo de volta" subtitle="Sua vida financeira em um só lugar." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Saldo" value={brl(t.saldo)} tone="brand" hint="Período total" />
        <Stat label="Receitas" value={brl(t.receitas)} tone="up" />
        <Stat label="Despesas" value={brl(t.despesas)} tone="down" />
        <Stat label="Taxa de poupança" value={`${(t.taxaPoupanca * 100).toFixed(1)}%`} hint="Do que entrou, quanto sobrou" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <section className="panel p-5 xl:col-span-2">
          <h2 className="text-base font-semibold">Fluxo mensal</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={months}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => brl(v)} />
                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="var(--success)" fill="url(#gR)" strokeWidth={2} />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="var(--primary)" fill="url(#gD)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="text-base font-semibold">Gastos por categoria</h2>
          <div className="h-52">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cats} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                  {cats.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v: number) => brl(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 text-sm">
            {cats.slice(0, 5).map((c, i) => (
              <li key={c.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />{c.name}</span>
                <span className="text-muted-foreground">{brl(c.value)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <section className="panel p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Últimas movimentações</h2>
            <Link to="/transacoes" className="text-sm text-primary">Ver todas</Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {txs.slice(0, 6).map((tx) => (
              <li key={tx.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} · {new Date(tx.date + "T00:00").toLocaleDateString("pt-BR")}</p>
                </div>
                <span className={tx.type === "receita" ? "text-success" : "text-destructive"}>
                  {tx.type === "receita" ? "+" : "−"} {brl(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel flex flex-col p-5">
          <h2 className="text-base font-semibold">Metas</h2>
          <div className="mt-3 space-y-4">
            {goals.map((g) => {
              const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm"><span>{g.name}</span><span className="text-muted-foreground">{pct.toFixed(0)}%</span></div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
          <Link to="/assistente" className="mt-auto flex items-center gap-3 rounded-xl border border-border bg-accent p-4 pt-4 text-sm transition-colors hover:border-primary">
            <Bot className="size-5 text-primary" /> Pergunte ao assistente como economizar mais
          </Link>
        </section>
      </div>
    </>
  );
}
