import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { PageHeader, Stat, tooltipStyle, CHART_COLORS } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { brl, byCategory, monthly, totals, transactionsQuery } from "@/lib/finance";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios · FinControl AI" },
      { name: "description", content: "Relatórios mensais e por categoria, com exportação em CSV." },
      { property: "og:title", content: "Relatórios · FinControl AI" },
      { property: "og:description", content: "Relatórios mensais e por categoria, com exportação em CSV." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(transactionsQuery),
  component: Reports,
});

function Reports() {
  const { data: txs } = useSuspenseQuery(transactionsQuery);
  const months = monthly(txs);
  const cats = byCategory(txs);
  const t = totals(txs);
  const avgExpense = months.length ? t.despesas / months.length : 0;
  const best = [...months].sort((a, b) => b.saldo - a.saldo)[0];

  const exportCsv = () => {
    const rows = [["Data", "Descrição", "Tipo", "Categoria", "Valor"], ...txs.map((x) => [x.date, x.description, x.type, x.category, x.amount.toFixed(2)])];
    const blob = new Blob([rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fincontrol-relatorio.csv";
    a.click();
  };

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Entenda para onde vai seu dinheiro."
        action={<Button onClick={exportCsv}><Download /> Exportar CSV</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Gasto médio mensal" value={brl(avgExpense)} />
        <Stat label="Maior categoria" value={cats[0]?.name ?? "—"} hint={cats[0] ? brl(cats[0].value) : undefined} />
        <Stat label="Melhor mês" value={best?.mes ?? "—"} hint={best ? `Saldo de ${brl(best.saldo)}` : undefined} tone="up" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-base font-semibold">Receitas x Despesas</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={months}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)" }} formatter={(v: number) => brl(v)} />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="var(--success)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="text-base font-semibold">Evolução do saldo mensal</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={months}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => brl(v)} />
                <Line dataKey="saldo" name="Saldo" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-5 xl:col-span-2">
          <h2 className="text-base font-semibold">Despesas por categoria</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={cats} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={12} width={90} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)" }} formatter={(v: number) => brl(v)} />
                <Bar dataKey="value" name="Total" radius={[0, 6, 6, 0]}>
                  {cats.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}
