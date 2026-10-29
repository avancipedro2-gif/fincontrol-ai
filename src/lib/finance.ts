import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TxType = "receita" | "despesa";
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TxType;
  category: string;
  date: string;
}
export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
}

export const CATEGORIES = {
  receita: ["Salário", "Freelance", "Investimentos", "Outros"],
  despesa: ["Moradia", "Alimentação", "Transporte", "Saúde", "Lazer", "Educação", "Assinaturas", "Outros"],
} as const;

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

// Financial tables are closed to visitors without login; show empty data instead of crashing.
export function isAccessDenied(error: { code?: string } | null): boolean {
  return error?.code === "42501";
}

export const transactionsQuery = queryOptions({
  queryKey: ["transactions"],
  queryFn: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false });
    if (error) {
      if (isAccessDenied(error)) return [];
      throw error;
    }
    return (data ?? []).map((t) => ({ ...t, amount: Number(t.amount), type: t.type as TxType }));
  },
});

export const goalsQuery = queryOptions({
  queryKey: ["goals"],
  queryFn: async (): Promise<Goal[]> => {
    const { data, error } = await supabase.from("goals").select("*").order("created_at");
    if (error) {
      if (isAccessDenied(error)) return [];
      throw error;
    }
    return (data ?? []).map((g) => ({
      ...g,
      target_amount: Number(g.target_amount),
      current_amount: Number(g.current_amount),
    }));
  },
});

export function totals(txs: Transaction[]) {
  const receitas = txs.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
  const despesas = txs.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
  return { receitas, despesas, saldo: receitas - despesas, taxaPoupanca: receitas ? (receitas - despesas) / receitas : 0 };
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function monthly(txs: Transaction[]) {
  const map = new Map<string, { mes: string; receitas: number; despesas: number }>();
  [...txs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((t) => {
      const key = t.date.slice(0, 7);
      const label = `${MONTHS[Number(key.slice(5, 7)) - 1]}/${key.slice(2, 4)}`;
      const row = map.get(key) ?? { mes: label, receitas: 0, despesas: 0 };
      row[t.type === "receita" ? "receitas" : "despesas"] += t.amount;
      map.set(key, row);
    });
  return [...map.values()].map((r) => ({ ...r, saldo: r.receitas - r.despesas }));
}

export function byCategory(txs: Transaction[], type: TxType = "despesa") {
  const map = new Map<string, number>();
  txs.filter((t) => t.type === type).forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

/** Juros compostos com aporte mensal. Taxa anual em % convertida para taxa mensal equivalente. */
export function simulate(initial: number, monthlyContribution: number, annualRatePct: number, years: number) {
  const r = Math.pow(1 + annualRatePct / 100, 1 / 12) - 1;
  const rows: { ano: number; investido: number; total: number; juros: number }[] = [];
  let total = initial;
  let investido = initial;
  rows.push({ ano: 0, investido, total, juros: 0 });
  for (let m = 1; m <= years * 12; m++) {
    total = total * (1 + r) + monthlyContribution;
    investido += monthlyContribution;
    if (m % 12 === 0) rows.push({ ano: m / 12, investido, total, juros: total - investido });
  }
  return rows;
}

export function financialSummary(txs: Transaction[], goals: Goal[]) {
  const t = totals(txs);
  const cats = byCategory(txs).map((c) => `${c.name}: ${brl(c.value)}`).join("; ");
  const months = monthly(txs).map((m) => `${m.mes}: receitas ${brl(m.receitas)}, despesas ${brl(m.despesas)}`).join("; ");
  const g = goals
    .map((x) => `${x.name}: ${brl(x.current_amount)} de ${brl(x.target_amount)}${x.deadline ? ` até ${x.deadline}` : ""}`)
    .join("; ");
  return `Receitas totais: ${brl(t.receitas)}. Despesas totais: ${brl(t.despesas)}. Saldo: ${brl(t.saldo)}. Taxa de poupança: ${(t.taxaPoupanca * 100).toFixed(1)}%.
Despesas por categoria: ${cats}.
Por mês: ${months}.
Metas: ${g || "nenhuma"}.`;
}
