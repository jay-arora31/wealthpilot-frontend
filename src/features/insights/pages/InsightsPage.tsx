import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useInsights } from "../hooks/use-insights";
import { IncomeExpenseChart } from "../components/IncomeExpenseChart";
import { NetWorthChart } from "../components/NetWorthChart";
import { AccountDistributionChart } from "../components/AccountDistributionChart";
import { MembersPerHouseholdChart } from "../components/MembersPerHouseholdChart";
import { TaxBracketChart } from "../components/TaxBracketChart";
import { RiskToleranceChart } from "../components/RiskToleranceChart";
import { TopWealthChart } from "../components/TopWealthChart";
import { LiquidityChart } from "../components/LiquidityChart";
import type { InsightsResponse } from "@/types";
import { formatCompact, pluralize } from "@/lib/format";
import {
  BarChart3, TrendingUp, Users, Landmark, Wallet,
  ArrowRight, DollarSign, PieChart, Activity,
} from "lucide-react";

/* ── KPI summary bar ─────────────────────────────────────────── */
function SummaryBar({ data }: { data: InsightsResponse }) {
  // Households are the union of every per-household dataset — using a single
  // dataset length (e.g. members_per_household) would miss households with no
  // members, etc.
  const householdIds = new Set<string>([
    ...data.income_vs_expenses.map(d => d.household_id),
    ...data.net_worth.map(d => d.household_id),
    ...data.members_per_household.map(d => d.household_id),
  ]);
  const totalHouseholds = householdIds.size;

  const withIncome = data.income_vs_expenses.filter(d => d.income != null).length;
  const withNetWorth = data.net_worth.filter(d => d.net_worth != null).length;
  const withRisk = data.risk_tolerance_distribution.reduce((s, d) => s + d.household_count, 0);

  const totalIncome = data.income_vs_expenses.reduce((s, d) => s + (d.income ? Number(d.income) : 0), 0);
  const totalNW = data.net_worth.reduce((s, d) => s + (d.net_worth ? Number(d.net_worth) : 0), 0);
  const totalLiquid = data.net_worth.reduce((s, d) => s + (d.liquid_net_worth ? Number(d.liquid_net_worth) : 0), 0);
  const totalAccounts = data.account_distribution.reduce((s, d) => s + d.count, 0);
  const totalMembers = data.members_per_household.reduce((s, d) => s + d.member_count, 0);
  const avgLiquidity = totalNW > 0 ? ((totalLiquid / totalNW) * 100).toFixed(0) : "0";
  const coveragePct = totalHouseholds > 0 ? Math.round((withRisk / totalHouseholds) * 100) : 0;

  const stats = [
    {
      label: "Total Households",
      value: String(totalHouseholds),
      sub: pluralize(totalMembers, "member"),
      icon: Users,
      style: "stat-card-green",
      iconColor: "text-primary",
      iconBg: "bg-primary/15",
    },
    {
      label: "Portfolio Income",
      value: formatCompact(totalIncome),
      sub: withIncome > 0
        ? `${withIncome}/${totalHouseholds} · avg ${formatCompact(totalIncome / withIncome)}`
        : "No data yet",
      icon: DollarSign,
      style: "stat-card-teal",
      iconColor: "text-[hsl(172,60%,38%)]",
      iconBg: "bg-[hsl(172,66%,40%)]/15",
    },
    {
      label: "Total Net Worth",
      value: formatCompact(totalNW),
      sub: withNetWorth > 0
        ? `${withNetWorth}/${totalHouseholds} · ${formatCompact(totalLiquid)} liquid`
        : "No data yet",
      icon: Wallet,
      style: "stat-card-blue",
      iconColor: "text-[hsl(217,80%,55%)]",
      iconBg: "bg-[hsl(217,91%,60%)]/15",
    },
    {
      label: "Avg Liquidity Ratio",
      value: `${avgLiquidity}%`,
      sub: "liquid / net worth",
      icon: Activity,
      style: "stat-card-amber",
      iconColor: "text-[hsl(38,80%,42%)]",
      iconBg: "bg-[hsl(38,80%,55%)]/15",
    },
    {
      label: "Total Accounts",
      value: String(totalAccounts),
      sub: pluralize(data.account_distribution.length, "account type"),
      icon: Landmark,
      style: "bg-white border border-border",
      iconColor: "text-[hsl(262,50%,52%)]",
      iconBg: "bg-[hsl(262,60%,55%)]/10",
    },
    {
      label: "Risk Profile Coverage",
      value: `${withRisk}/${totalHouseholds}`,
      sub: `${coveragePct}% of households`,
      icon: PieChart,
      style: "bg-white border border-border",
      iconColor: "text-[hsl(0,65%,52%)]",
      iconBg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className={`${s.style} rounded-xl p-4 flex flex-col gap-3 shadow-sm card-hover`}>
            <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${s.iconColor}`} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
                {s.label}
              </p>
              <p className="text-xl font-bold font-mono tabular-nums text-foreground mt-1">{s.value}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{s.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Section header ─────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType; title: string; description: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────── */
function ChartSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className={`w-full rounded-lg ${tall ? "h-[320px]" : "h-[260px]"}`} />
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export function InsightsPage() {
  const { data, isLoading, isError } = useInsights();

  const hasData = data && (
    data.income_vs_expenses.length > 0 ||
    data.net_worth.length > 0 ||
    data.account_distribution.length > 0 ||
    data.members_per_household.length > 0
  );

  return (
    <div className="space-y-10">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Insights Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated financial analytics across all client households
          </p>
        </div>
        {hasData && (
          <div className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live data
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-8">
          <div className="grid grid-cols-6 gap-4">
            {[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-[100px] rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[0,1,2,3].map(i => <ChartSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[0,1].map(i => <ChartSkeleton key={i} />)}
          </div>
          <ChartSkeleton tall />
          <div className="grid grid-cols-2 gap-6">
            {[0,1].map(i => <ChartSkeleton key={i} />)}
          </div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-destructive">Failed to load insights</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check that the backend is running on port 8000
          </p>
        </div>
      )}

      {/* Empty state */}
      {data && !hasData && (
        <div className="flex flex-col items-center justify-center py-28 gap-7 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">No data to visualize yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Upload an Excel file with household data to populate the dashboard with
              income, net worth, account distribution, and client analytics.
            </p>
          </div>
          <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-white">
            <Link to="/">
              Go to Households
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {hasData && (
        <div className="space-y-10">

          {/* KPI strip */}
          <SummaryBar data={data} />

          {/* Section 1 — Income & Wealth */}
          <div className="space-y-4">
            <SectionHeader
              icon={TrendingUp}
              title="Income & Wealth"
              description="Annual income and net worth across all households"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IncomeExpenseChart data={data.income_vs_expenses} />
              <NetWorthChart data={data.net_worth} />
            </div>
          </div>

          {/* Section 2 — Client Profile */}
          <div className="space-y-4">
            <SectionHeader
              icon={Users}
              title="Client Profiles"
              description="Risk tolerance, tax brackets, and household composition"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.risk_tolerance_distribution.length > 0 && (
                <RiskToleranceChart data={data.risk_tolerance_distribution} />
              )}
              {data.tax_bracket_distribution.length > 0 && (
                <TaxBracketChart data={data.tax_bracket_distribution} />
              )}
              <MembersPerHouseholdChart data={data.members_per_household} />
              {data.account_distribution.length > 0 && (
                <AccountDistributionChart data={data.account_distribution} />
              )}
            </div>
          </div>

          {/* Section 3 — Wealth Concentration (full-width) */}
          {data.top_households_by_wealth.length > 0 && (
            <div className="space-y-4">
              <SectionHeader
                icon={Wallet}
                title="Wealth Concentration"
                description="Top households ranked by net worth, liquid assets, and income · click a bar to open"
              />
              <TopWealthChart data={data.top_households_by_wealth} />
            </div>
          )}

          {/* Section 4 — Liquidity */}
          {data.liquidity_ratios.length > 0 && (
            <div className="space-y-4">
              <SectionHeader
                icon={Activity}
                title="Liquidity Analysis"
                description="Percentage of net worth held in liquid assets per household"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LiquidityChart data={data.liquidity_ratios} />
                {/* Liquidity tier breakdown summary */}
                <div className="bg-white border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Liquidity Tiers</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Households grouped by liquid asset accessibility</p>
                  </div>
                  {(() => {
                    const byRatio = [...data.liquidity_ratios].sort((a, b) => b.liquid_ratio - a.liquid_ratio);
                    const high = byRatio.filter(d => d.liquid_ratio >= 50);
                    const mid  = byRatio.filter(d => d.liquid_ratio >= 25 && d.liquid_ratio < 50);
                    const low  = byRatio.filter(d => d.liquid_ratio < 25);
                    const total = data.liquidity_ratios.length;
                    const tiers = [
                      { label: "High Liquidity", sub: "≥ 50% liquid", items: high, color: "bg-emerald-500", textColor: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
                      { label: "Moderate", sub: "25–49% liquid", items: mid, color: "bg-amber-500", textColor: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
                      { label: "Low Liquidity", sub: "< 25% liquid", items: low, color: "bg-red-500", textColor: "text-red-700", bg: "bg-red-50 border-red-200" },
                    ];
                    return (
                      <div className="space-y-3">
                        {tiers.map(t => (
                          <div key={t.label} className={`rounded-xl border p-4 ${t.bg}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                                <span className={`text-sm font-semibold ${t.textColor}`}>{t.label}</span>
                              </div>
                              <span className={`text-sm font-bold font-mono ${t.textColor}`}>{t.items.length} <span className="text-xs font-normal opacity-60">/ {total}</span></span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{t.sub}</p>
                            {t.items.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {t.items.slice(0, 6).map(h => (
                                  <span key={h.household_name}
                                    className="text-[10px] bg-white/70 border border-current/20 rounded-full px-2 py-0.5 font-medium truncate max-w-[120px]"
                                    title={h.household_name}>
                                    {h.household_name.split(" ").slice(0, 2).join(" ")} · {h.liquid_ratio.toFixed(0)}%
                                  </span>
                                ))}
                                {t.items.length > 6 && (
                                  <span className="text-[10px] text-muted-foreground">+{t.items.length - 6} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
