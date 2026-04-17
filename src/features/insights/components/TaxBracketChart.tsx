import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TaxBracketDistribution } from "@/types";
import { Receipt } from "lucide-react";
import { pluralize } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

const BRACKET_COLORS: Record<string, string> = {
  "10%": "hsl(172,66%,38%)",
  "12%": "hsl(172,56%,45%)",
  "15%": "hsl(var(--chart-2))",
  "20%": "hsl(var(--chart-1))",
  "22%": "hsl(45,90%,50%)",
  "24%": "hsl(38,80%,45%)",
  "25%": "hsl(var(--chart-4))",
  "30%": "hsl(24,80%,50%)",
  "32%": "hsl(16,80%,50%)",
  "35%": "hsl(0,70%,50%)",
  "37%": "hsl(0,80%,40%)",
  "Highest": "hsl(0,85%,35%)",
};

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-6))",
];

interface Props { data: TaxBracketDistribution[] }

export function TaxBracketChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => a.tax_bracket.localeCompare(b.tax_bracket));
  const total = sorted.reduce((s, d) => s + d.household_count, 0);

  const chartData = sorted.map((d, i) => ({
    name: d.tax_bracket,
    fullName: `${d.tax_bracket} tax bracket`,
    value: d.household_count,
    fill: BRACKET_COLORS[d.tax_bracket] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Tax Bracket Distribution</CardTitle>
            <CardDescription className="text-xs">
              {pluralize(total, "household")} across {pluralize(sorted.length, "bracket")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} innerRadius={48}
                  strokeWidth={2} stroke="white"
                >
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 min-w-[120px] pr-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.fill }} />
                <span className="text-muted-foreground flex-1">{d.name}</span>
                <span className="font-bold tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
