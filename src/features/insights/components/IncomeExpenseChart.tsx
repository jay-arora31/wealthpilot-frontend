import { useNavigate } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { IncomeExpenseItem } from "@/types";
import { TrendingUp } from "lucide-react";
import { formatAxisCurrency, shortHouseholdName } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

interface Props { data: IncomeExpenseItem[] }

export function IncomeExpenseChart({ data }: Props) {
  const navigate = useNavigate();

  const sorted = [...data]
    .filter(d => d.income)
    .sort((a, b) => Number(b.income) - Number(a.income))
    .slice(0, 15);

  const chartData = sorted.map(d => ({
    name: shortHouseholdName(d.household_name),
    fullName: d.household_name,
    householdId: d.household_id,
    Income: d.income ? Number(d.income) : 0,
  }));

  const withIncome = data.filter(d => d.income).length;

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Annual Income by Household</CardTitle>
            <CardDescription className="text-xs">
              Top {chartData.length} of {withIncome} with income data · click a bar for details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ left: 4, right: 16, top: 20, bottom: 4 }} layout="vertical">
            <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
              tickFormatter={formatAxisCurrency}
            />
            <YAxis
              dataKey="name" type="category" width={90}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false} axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
            <Bar
              dataKey="Income"
              radius={4}
              maxBarSize={22}
              cursor="pointer"
              onClick={(d: { payload?: { householdId?: string } }) => {
                const id = d?.payload?.householdId;
                if (id) navigate(`/households/${id}`);
              }}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill="hsl(var(--chart-1))" opacity={1 - i * 0.04} />
              ))}
              <LabelList
                dataKey="Income" position="right" formatter={(v: unknown) => formatAxisCurrency(Number(v))}
                style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
