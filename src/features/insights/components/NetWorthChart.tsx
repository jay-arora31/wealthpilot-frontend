import { useNavigate } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { NetWorthBreakdown } from "@/types";
import { Wallet } from "lucide-react";
import { formatAxisCurrency, shortHouseholdName } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

interface Props { data: NetWorthBreakdown[] }

export function NetWorthChart({ data }: Props) {
  const navigate = useNavigate();

  const sorted = [...data]
    .filter(d => d.net_worth)
    .sort((a, b) => Number(b.net_worth) - Number(a.net_worth))
    .slice(0, 12);

  const chartData = sorted.map(d => ({
    name: shortHouseholdName(d.household_name),
    fullName: d.household_name,
    householdId: d.household_id,
    "Net Worth": d.net_worth ? Number(d.net_worth) : 0,
    "Liquid": d.liquid_net_worth ? Number(d.liquid_net_worth) : 0,
  }));

  const withNetWorth = data.filter(d => d.net_worth).length;

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[hsl(172,66%,40%)]/10 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-[hsl(172,60%,38%)]" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Net Worth vs Liquid Assets</CardTitle>
            <CardDescription className="text-xs">
              Top {chartData.length} of {withNetWorth} with net worth data · click a bar for details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ left: 4, right: 8, top: 4, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
              interval={0} angle={-30} textAnchor="end" height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
              tickFormatter={formatAxisCurrency}
            />
            <Tooltip
              content={
                <ChartTooltip
                  footer={items => {
                    const nw = items.find(i => i.name === "Net Worth")?.value ?? 0;
                    const lq = items.find(i => i.name === "Liquid")?.value ?? 0;
                    if (nw <= 0) return null;
                    const pct = ((lq / nw) * 100).toFixed(0);
                    return (
                      <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground flex justify-between">
                        <span>Liquidity ratio</span>
                        <span className="font-semibold text-foreground">{pct}%</span>
                      </div>
                    );
                  }}
                />
              }
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} iconType="square" iconSize={10} />
            <Bar
              dataKey="Net Worth" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={32}
              cursor="pointer"
              onClick={(d: { payload?: { householdId?: string } }) => {
                const id = d?.payload?.householdId;
                if (id) navigate(`/households/${id}`);
              }}
            />
            <Bar
              dataKey="Liquid" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={32}
              cursor="pointer"
              onClick={(d: { payload?: { householdId?: string } }) => {
                const id = d?.payload?.householdId;
                if (id) navigate(`/households/${id}`);
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
