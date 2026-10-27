import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Stat } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { brl, CATEGORIES, totals, transactionsQuery, type TxType } from "@/lib/finance";

export const Route = createFileRoute("/transacoes")({
  head: () => ({
    meta: [
      { title: "Receitas e Despesas · FinControl AI" },
      { name: "description", content: "Registre e acompanhe suas receitas e despesas por categoria." },
      { property: "og:title", content: "Receitas e Despesas · FinControl AI" },
      { property: "og:description", content: "Registre e acompanhe suas receitas e despesas por categoria." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(transactionsQuery),
  component: Transactions,
});

function Transactions() {
  const qc = useQueryClient();
  const { data: txs } = useSuspenseQuery(transactionsQuery);
  const [filter, setFilter] = useState<"todas" | TxType>("todas");
  const [type, setType] = useState<TxType>("despesa");
  const [form, setForm] = useState({ description: "", amount: "", category: "Alimentação", date: new Date().toISOString().slice(0, 10) });

  const add = useMutation({
    mutationFn: async () => {
      const amount = Number(form.amount.replace(",", "."));
      if (!form.description.trim() || !(amount > 0)) throw new Error("Preencha descrição e um valor maior que zero.");
      const { error } = await supabase.from("transactions").insert({ ...form, description: form.description.trim(), amount, type });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setForm((f) => ({ ...f, description: "", amount: "" }));
      toast.success("Movimentação adicionada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const list = filter === "todas" ? txs : txs.filter((t) => t.type === filter);
  const t = totals(txs);

  return (
    <>
      <PageHeader title="Receitas e Despesas" subtitle="Registre cada entrada e saída." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Receitas" value={brl(t.receitas)} tone="up" />
        <Stat label="Despesas" value={brl(t.despesas)} tone="down" />
        <Stat label="Saldo" value={brl(t.saldo)} tone="brand" />
      </div>

      <form
        className="panel mt-4 grid gap-3 p-5 md:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <div className="flex rounded-lg bg-muted p-1 md:col-span-1">
          {(["despesa", "receita"] as const).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => {
                setType(k);
                setForm((f) => ({ ...f, category: CATEGORIES[k][0] }));
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize ${type === k ? (k === "receita" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground") : "text-muted-foreground"}`}
            >
              {k}
            </button>
          ))}
        </div>
        <Input className="md:col-span-2" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Input inputMode="decimal" placeholder="Valor (R$)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES[type].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Button type="submit" size="icon" disabled={add.isPending} aria-label="Adicionar"><Plus /></Button>
        </div>
      </form>

      <section className="panel mt-4 p-5">
        <div className="flex gap-2">
          {(["todas", "receita", "despesa"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "secondary"} onClick={() => setFilter(f)} className="capitalize">
              {f === "todas" ? "Todas" : f + "s"}
            </Button>
          ))}
        </div>
        <ul className="mt-3 divide-y divide-border">
          {list.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{tx.category} · {new Date(tx.date + "T00:00").toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`whitespace-nowrap ${tx.type === "receita" ? "text-success" : "text-destructive"}`}>
                  {tx.type === "receita" ? "+" : "−"} {brl(tx.amount)}
                </span>
                <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => remove.mutate(tx.id)}><Trash2 className="size-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
