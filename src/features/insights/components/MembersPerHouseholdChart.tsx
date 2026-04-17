import { useNavigate } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { MembersPerHousehold } from "@/types";
import { Users } from "lucide-react";
import { shortHouseholdName, pluralize } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

const COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-6))",
];

interface Props { data: MembersPerHousehold[] }

const BAR_WIDTH = 40;
const MIN_CHART_WIDTH = 300;

export function MembersPerHouseholdChart({ data }: Props) {
  const navigate = useNavigate();

  const sorted = [...data].sort((a, b) => b.member_count - a.member_count);
  const avgMembers = sorted.length > 0
    ? (sorted.reduce((s, d) => s + d.member_count, 0) / sorted.length).toFixed(1)
    : "0";
  const maxCount = sorted.length > 0 ? Math.max(...sorted.map(d => d.member_count)) : 0;

  const chartData = sorted.map(d => ({
    name: shortHouseholdName(d.household_name).split(" ").slice(0, 2).join(" "),
    fullName: d.household_name,
    householdId: d.household_id,
    Members: d.member_count,
  }));

  const chartWidth = Math.max(MIN_CHART_WIDTH, chartData.length * BAR_WIDTH + 60);

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[hsl(262,60%,55%)]/10 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-[hsl(262,50%,52%)]" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Members per Household</CardTitle>
            <CardDescription className="text-xs">
              Avg {avgMembers} · {pluralize(sorted.length, "household")} · click a bar for details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-3">
        <div className="overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          <div style={{ width: chartWidth, minWidth: "100%" }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ left: 4, right: 12, top: 20, bottom: 60 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false} axisLine={false}
                  interval={0} angle={-40} textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false} axisLine={false}
                  allowDecimals={false}
                  domain={[0, maxCount + 1]}
                  width={24}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      format={(v) => pluralize(v, "member")}
                    />
                  }
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                />
                <Bar
                  dataKey="Members" radius={[4, 4, 0, 0]} maxBarSize={32}
                  cursor="pointer"
                  onClick={(d: { payload?: { householdId?: string } }) => {
                    const id = d?.payload?.householdId;
                    if (id) navigate(`/households/${id}`);
                  }}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="Members" position="top"
                    style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
