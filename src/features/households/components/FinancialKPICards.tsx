import type { HouseholdDetail } from "@/types";
import { DollarSign, TrendingUp, Droplets, Receipt, ShieldCheck, Clock } from "lucide-react";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface FinancialKPICardsProps {
  household: HouseholdDetail;
}

const CARDS = [
  {
    key: "income" as const,
    label: "Annual Income",
    format: (v: string | number | null) => v != null ? fmt.format(Number(v)) : null,
    icon: DollarSign,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    key: "net_worth" as const,
    label: "Net Worth",
    format: (v: string | number | null) => v != null ? fmt.format(Number(v)) : null,
    icon: TrendingUp,
    accent: "text-teal-600",
    iconBg: "bg-teal-50",
  },
  {
    key: "liquid_net_worth" as const,
    label: "Liquid Net Worth",
    format: (v: string | number | null) => v != null ? fmt.format(Number(v)) : null,
    icon: Droplets,
    accent: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    key: "tax_bracket" as const,
    label: "Tax Bracket",
    format: (v: string | number | null) => v ? String(v) : null,
    icon: Receipt,
    accent: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    key: "risk_tolerance" as const,
    label: "Risk Profile",
    format: (v: string | number | null) => v ? String(v) : null,
    icon: ShieldCheck,
    accent: "text-slate-600",
    iconBg: "bg-slate-100",
  },
  {
    key: "time_horizon" as const,
    label: "Time Horizon",
    format: (v: string | number | null) => v ? String(v) : null,
    icon: Clock,
    accent: "text-violet-600",
    iconBg: "bg-violet-50",
  },
];

export function FinancialKPICards({ household }: FinancialKPICardsProps) {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const raw = household[card.key as keyof HouseholdDetail] as string | number | null;
        const value = card.format(raw);
        const empty = value == null;

        return (
          <div
            key={card.key}
            className="bg-white border border-border rounded-xl px-4 py-4 flex flex-col gap-2 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${empty ? "bg-muted" : card.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${empty ? "text-muted-foreground/40" : card.accent}`} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                {card.label}
              </span>
            </div>
            <p className={`text-lg font-bold leading-none tabular-nums ${empty ? "text-muted-foreground/25" : card.accent}`}>
              {value ?? "—"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
