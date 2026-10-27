import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Stat, tooltipStyle } from "@/components/AppShell";
import { Slider } from "@/components/ui/slider";
import { brl, simulate } from "@/lib/finance";

export const Route = createFileRoute("/investimentos")({
  head: () => ({
    meta: [
      { title: "Simulador de Investimentos · FinControl AI" },
      { name: "description", content: "Simule juros compostos com aportes mensais e veja seu patrimônio crescer." },
      { property: "og:title", content: "Simulador de Investimentos · FinControl AI" },
      { property: "og:description", content: "Simule juros compostos com aportes mensais e veja seu patrimônio crescer." },
    ],
  }),
  component: Simulator,
});

const PRESETS = [
  { label: "Poupança", rate: 6.2 },
  { label: "CDB 100% CDI", rate: 10.5 },
  { label: "Tesouro IPCA+", rate: 11.5 },
  { label: "Ações (histórico)", rate: 14 },
];

function Simulator() {
  const [initial, setInitial] = useState(5000);
  const [monthly, setMonthly] = useState(800);
  const [rate, setRate] = useState(10.5);
  const [years, setYears] = useState(10);
  const data = useMemo(() => simulate(initial, monthly, rate, years), [initial, monthly, rate, years]);
  const last = data[data.length - 1]!;

  const fields = [
    { label: "Valor inicial", value: initial, set: setInitial, min: 0, max: 100000, step: 500, fmt: brl },
    { label: "Aporte mensal", value: monthly, set: setMonthly, min: 0, max: 10000, step: 50, fmt: brl },
    { label: "Rentabilidade anual", value: rate, set: setRate, min: 1, max: 20, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
    { label: "Prazo", value: years, set: setYears, min: 1, max: 40, step: 1, fmt: (v: number) => `${v} anos` },
  ];

  return (
    <>
      <PageHeader title="Simulador de Investimentos" subtitle="Juros compostos com aportes mensais." />
      <div className="grid gap-4 xl:grid-cols-3">
        <section className="panel space-y-6 p-5">
          {fields.map((f) => (
            <div key={f.label}>
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-semibold">{f.fmt(f.value)}</span>
              </div>
              <Slider value={[f.value]} min={f.min} max={f.max} step={f.step} onValueChange={([v]) => v !== undefined && f.set(v)} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => setRate(p.rate)} className={`rounded-full border px-3 py-1 text-xs ${rate === p.rate ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                {p.label} · {p.rate}%
              </button>
            ))}
          </div>
        </section>
        <div className="space-y-4 xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Patrimônio final" value={brl(last.total)} tone="brand" />
            <Stat label="Total investido" value={brl(last.investido)} />
            <Stat label="Juros ganhos" value={brl(last.juros)} tone="up" />
          </div>
          <section className="panel p-5">
            <div className="h-80">
              <ResponsiveContainer>
                <AreaChart data={data}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="ano" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v}a`} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => brl(v)} labelFormatter={(l) => `Ano ${l}`} />
                  <Legend />
                  <Area dataKey="investido" name="Investido" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                  <Area dataKey="total" name="Patrimônio" stroke="var(--success)" fill="var(--success)" fillOpacity={0.25} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
