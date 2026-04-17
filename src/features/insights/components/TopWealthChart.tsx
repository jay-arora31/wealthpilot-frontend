import { useNavigate } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TopHouseholdByWealth } from "@/types";
import { Crown } from "lucide-react";
import { formatAxisCurrency, shortHouseholdName } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

interface Props { data: TopHouseholdByWealth[] }

export function TopWealthChart({ data }: Props) {
  const navigate = useNavigate();

  const chartData = data.map(d => ({
    name: shortHouseholdName(d.household_name),
    fullName: d.household_name,
    householdId: d.household_id,
    "Net Worth": Number(d.net_worth),
    "Liquid": Number(d.liquid_net_worth),
    "Income": Number(d.income),
  }));

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Crown className="w-3.5 h-3.5 text-yellow-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Top Households by Net Worth</CardTitle>
            <CardDescription className="text-xs">
              Ranked by total net worth · top {chartData.length} · click a bar for details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ left: 8, right: 8, top: 4, bottom: 36 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
              interval={0} angle={-35} textAnchor="end" height={60}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
              tickFormatter={formatAxisCurrency}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} iconType="square" iconSize={10} />
            {(["Net Worth", "Liquid", "Income"] as const).map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`hsl(var(--chart-${i + 1}))`}
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
                cursor="pointer"
                onClick={(d: { payload?: { householdId?: string } }) => {
                  const id = d?.payload?.householdId;
                  if (id) navigate(`/households/${id}`);
                }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
