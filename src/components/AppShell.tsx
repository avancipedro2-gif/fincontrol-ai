import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ArrowLeftRight, LineChart, Target, Bot, FileBarChart } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transacoes", label: "Receitas e Despesas", icon: ArrowLeftRight },
  { to: "/investimentos", label: "Simulador", icon: LineChart },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/assistente", label: "Assistente IA", icon: Bot },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-sidebar-border p-4 text-xs text-muted-foreground">
          Modo demonstração · dados de exemplo compartilhados
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <Brand />
        </header>
        <main className="flex-1 px-4 py-6 pb-24 sm:px-8 lg:pb-10">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-border bg-sidebar lg:hidden">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground data-[status=active]:text-primary"
            >
              <Icon className="size-5" />
              <span className="truncate">{label.split(" ")[0]}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-brand font-display text-sm font-bold text-primary-foreground shadow-glow">
        FC
      </span>
      <span className="font-display text-lg font-semibold">
        FinControl <span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string | undefined; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "default" }: { label: string; value: string; hint?: string | undefined; tone?: "default" | "up" | "down" | "brand" }) {
  const toneCls = { default: "text-foreground", up: "text-success", down: "text-destructive", brand: "text-gradient" }[tone];
  return (
    <div className="panel p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-2xl font-semibold ${toneCls}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    color: "var(--popover-foreground)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--muted-foreground)" },
};

export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)", "var(--success)", "var(--muted-foreground)"];
