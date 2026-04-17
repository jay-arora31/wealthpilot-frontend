import {
  Bar, BarChart, CartesianGrid, Cell, LabelList,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { RiskToleranceDistribution } from "@/types";
import { ShieldCheck } from "lucide-react";
import { pluralize } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

const RISK_COLORS: Record<string, string> = {
  Conservative: "hsl(172,60%,38%)",
  Low: "hsl(172,50%,45%)",
  Moderate: "hsl(var(--chart-4))",
  Medium: "hsl(var(--chart-4))",
  Aggressive: "hsl(0,70%,52%)",
  High: "hsl(0,70%,52%)",
};

const RISK_ORDER = ["Conservative", "Low", "Moderate", "Medium", "Aggressive", "High"];

interface Props { data: RiskToleranceDistribution[] }

export function RiskToleranceChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.household_count, 0);

  const sorted = [...data].sort((a, b) => {
    const ai = RISK_ORDER.indexOf(a.risk_tolerance);
    const bi = RISK_ORDER.indexOf(b.risk_tolerance);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const chartData = sorted.map(d => ({
    name: d.risk_tolerance,
    fullName: `${d.risk_tolerance} risk tolerance`,
    Households: d.household_count,
    fill: RISK_COLORS[d.risk_tolerance] ?? "hsl(var(--chart-3))",
  }));

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Risk Tolerance Profile</CardTitle>
            <CardDescription className="text-xs">{pluralize(total, "household")} categorised</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ left: -8, right: 8, top: 24, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
              allowDecimals={false} domain={[0, "dataMax + 1"]}
            />
            <Tooltip
              content={
                <ChartTooltip
                  format={(v) => pluralize(v, "household")}
                  footer={items => {
                    const v = items[0]?.value ?? 0;
                    if (total <= 0) return null;
                    const pct = ((v / total) * 100).toFixed(0);
                    return (
                      <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground flex justify-between">
                        <span>Share</span>
                        <span className="font-semibold text-primary">{pct}%</span>
                      </div>
                    );
                  }}
                />
              }
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            />
            <Bar dataKey="Households" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              <LabelList
                dataKey="Households" position="top"
                style={{ fontSize: 12, fontWeight: 700, fill: "hsl(var(--foreground))" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
