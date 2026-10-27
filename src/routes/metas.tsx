import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { brl, goalsQuery, type Goal } from "@/lib/finance";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas Financeiras · FinControl AI" },
      { name: "description", content: "Defina metas, acompanhe o progresso e saiba quanto guardar por mês." },
      { property: "og:title", content: "Metas Financeiras · FinControl AI" },
      { property: "og:description", content: "Defina metas, acompanhe o progresso e saiba quanto guardar por mês." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(goalsQuery),
  component: Goals,
});

function monthsLeft(deadline: string | null) {
  if (!deadline) return null;
  const d = new Date(deadline + "T00:00");
  const now = new Date();
  return Math.max(1, (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth());
}

function Goals() {
  const qc = useQueryClient();
  const { data: goals } = useSuspenseQuery(goalsQuery);
  const [form, setForm] = useState({ name: "", target: "", deadline: "" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["goals"] });

  const add = useMutation({
    mutationFn: async () => {
      const target = Number(form.target.replace(",", "."));
      if (!form.name.trim() || !(target > 0)) throw new Error("Informe nome e valor da meta.");
      const { error } = await supabase.from("goals").insert({ name: form.name.trim(), target_amount: target, deadline: form.deadline || null });
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      setForm({ name: "", target: "", deadline: "" });
      toast.success("Meta criada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Metas Financeiras" subtitle="Transforme objetivos em planos mensais." />
      <form
        className="panel grid gap-3 p-5 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <Input className="sm:col-span-2" placeholder="Nome da meta" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input inputMode="decimal" placeholder="Valor alvo (R$)" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
        <div className="flex gap-2">
          <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <Button type="submit" size="icon" aria-label="Criar meta"><Plus /></Button>
        </div>
      </form>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((g) => <GoalCard key={g.id} goal={g} onChange={refresh} />)}
      </div>
    </>
  );
}

function GoalCard({ goal, onChange }: { goal: Goal; onChange: () => void }) {
  const [deposit, setDeposit] = useState("");
  const pct = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  const left = Math.max(0, goal.target_amount - goal.current_amount);
  const months = monthsLeft(goal.deadline);

  const addDeposit = async () => {
    const v = Number(deposit.replace(",", "."));
    if (!(v > 0)) return undefined;
    const { error } = await supabase.from("goals").update({ current_amount: goal.current_amount + v }).eq("id", goal.id);
    if (error) { toast.error(error.message); return undefined; }
    setDeposit("");
    onChange();
  };
  const remove = async () => {
    await supabase.from("goals").delete().eq("id", goal.id);
    onChange();
  };

  return (
    <article className="panel p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{goal.name}</h3>
          {goal.deadline && <p className="text-xs text-muted-foreground">até {new Date(goal.deadline + "T00:00").toLocaleDateString("pt-BR")}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={remove} aria-label="Excluir meta"><Trash2 className="size-4" /></Button>
      </div>
      <p className="mt-4 font-display text-2xl font-semibold">{brl(goal.current_amount)}</p>
      <p className="text-xs text-muted-foreground">de {brl(goal.target_amount)}</p>
      <div className="mt-3 h-2.5 rounded-full bg-muted"><div className="h-2.5 rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
      <p className="mt-2 text-sm">
        {left === 0 ? <span className="text-success">Meta concluída!</span> : months ? <>Guarde <span className="text-success">{brl(left / months)}</span>/mês por {months} meses</> : <>Faltam {brl(left)}</>}
      </p>
      <div className="mt-4 flex gap-2">
        <Input inputMode="decimal" placeholder="Depositar R$" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
        <Button variant="secondary" onClick={addDeposit}>Adicionar</Button>
      </div>
    </article>
  );
}
