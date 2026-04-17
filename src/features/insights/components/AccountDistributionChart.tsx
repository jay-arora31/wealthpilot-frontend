import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AccountDistribution } from "@/types";
import { Landmark } from "lucide-react";
import { formatCurrency, formatCompact, pluralize } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(217,80%,55%)",
  "hsl(262,50%,52%)",
  "hsl(172,60%,38%)",
  "hsl(38,80%,45%)",
];

const TOP_N = 9;

interface Props { data: AccountDistribution[] }

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) {
  if (!percent || percent < 0.07) return null;
  const RADIAN = Math.PI / 180;
  const cxN = Number(cx ?? 0);
  const cyN = Number(cy ?? 0);
  const rIn = Number(innerRadius ?? 0);
  const rOut = Number(outerRadius ?? 0);
  const angle = Number(midAngle ?? 0);
  const radius = rIn + (rOut - rIn) * 0.5;
  const x = cxN + radius * Math.cos(-angle * RADIAN);
  const y = cyN + radius * Math.sin(-angle * RADIAN);
  return (
    <text
      x={x} y={y} fill="white"
      textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function AccountDistributionChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => Number(b.total_value) - Number(a.total_value));
  const totalValue = sorted.reduce((s, d) => s + Number(d.total_value), 0);
  const totalCount = sorted.reduce((s, d) => s + d.count, 0);

  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);

  const chartData = top.map((d, i) => ({
    name: d.account_type,
    fullName: d.account_type,
    value: Number(d.total_value),
    count: d.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  if (rest.length > 0) {
    chartData.push({
      name: `Other (${rest.length} types)`,
      fullName: `Other (${rest.length} account types)`,
      value: rest.reduce((s, d) => s + Number(d.total_value), 0),
      count: rest.reduce((s, d) => s + d.count, 0),
      fill: "hsl(var(--muted-foreground))",
    });
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[hsl(217,91%,60%)]/10 flex items-center justify-center">
            <Landmark className="w-3.5 h-3.5 text-[hsl(217,80%,55%)]" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Account Type Distribution</CardTitle>
            <CardDescription className="text-xs">
              {pluralize(totalCount, "account")} · {formatCompact(totalValue)} total AUM
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-4 items-start">
          <div className="shrink-0" style={{ width: 200 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={90}
                  strokeWidth={2} stroke="white"
                  labelLine={false} label={CustomLabel}
                >
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip
                      format={formatCurrency}
                      footer={items => {
                        const v = items[0]?.value ?? 0;
                        const count = items[0]?.payload.count as number | undefined;
                        if (totalValue <= 0) return null;
                        const pct = ((v / totalValue) * 100).toFixed(1);
                        return (
                          <>
                            <div className="mt-1 flex justify-between gap-4 text-xs">
                              <span className="text-muted-foreground">Share</span>
                              <span className="font-mono font-semibold text-primary">{pct}%</span>
                            </div>
                            {count !== undefined && (
                              <div className="mt-1 flex justify-between gap-4 text-xs">
                                <span className="text-muted-foreground">Accounts</span>
                                <span className="font-mono font-semibold">{count}</span>
                              </div>
                            )}
                          </>
                        );
                      }}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto max-h-[200px] space-y-1.5 py-1 pr-1">
            {sorted.map((d, i) => {
              const fill = i < TOP_N ? CHART_COLORS[i % CHART_COLORS.length] : "hsl(var(--muted-foreground))";
              const pct = totalValue > 0 ? ((Number(d.total_value) / totalValue) * 100).toFixed(0) : "0";
              return (
                <div key={d.account_type} className="flex items-center gap-2 text-xs group">
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: fill }} />
                  <span className="text-muted-foreground flex-1 min-w-0 truncate" title={d.account_type}>
                    {d.account_type}
                  </span>
                  <span className="text-muted-foreground/60 tabular-nums shrink-0">{pct}%</span>
                  <span className="font-semibold text-foreground tabular-nums shrink-0 w-5 text-right">{d.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
