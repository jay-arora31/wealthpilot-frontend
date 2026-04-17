import { useNavigate } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Cell, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LiquidityRatio } from "@/types";
import { Droplets } from "lucide-react";
import { shortHouseholdName } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

interface Props { data: LiquidityRatio[] }

function liquidityColor(v: number): string {
  if (v >= 50) return "hsl(172,60%,38%)";
  if (v >= 25) return "hsl(var(--chart-4))";
  return "hsl(0,65%,52%)";
}

export function LiquidityChart({ data }: Props) {
  const navigate = useNavigate();

  const avg = data.length > 0
    ? data.reduce((s, d) => s + d.liquid_ratio, 0) / data.length
    : 0;

  const chartData = data.map(d => ({
    name: shortHouseholdName(d.household_name),
    fullName: d.household_name,
    householdId: d.household_id,
    Liquidity: d.liquid_ratio,
  }));

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Liquidity Ratio</CardTitle>
            <CardDescription className="text-xs">
              Liquid / Total Net Worth · avg {avg.toFixed(0)}% · click a bar for details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex gap-3 mb-3 flex-wrap">
          {[
            { label: "≥ 50% High", color: "bg-emerald-500" },
            { label: "25–49% Moderate", color: "bg-amber-500" },
            { label: "< 25% Low", color: "bg-red-500" },
          ].map(t => (
            <div key={t.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${t.color}`} />
              {t.label}
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ left: -8, right: 8, top: 4, bottom: 36 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
              interval={0} angle={-30} textAnchor="end" height={55}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip
              content={<ChartTooltip format={(v) => `${v.toFixed(1)}%`} />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            />
            <ReferenceLine
              y={avg} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1.5}
              label={{
                value: `Avg ${avg.toFixed(0)}%`, position: "right",
                fontSize: 10, fill: "hsl(var(--muted-foreground))",
              }}
            />
            <Bar
              dataKey="Liquidity" radius={[4, 4, 0, 0]} maxBarSize={30}
              cursor="pointer"
              onClick={(d: { payload?: { householdId?: string } }) => {
                const id = d?.payload?.householdId;
                if (id) navigate(`/households/${id}`);
              }}
            >
              {chartData.map((d, i) => (
                <Cell key={i} fill={liquidityColor(d.Liquidity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
