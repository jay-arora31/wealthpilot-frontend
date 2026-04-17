import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { formatCurrency } from "@/lib/format";

type Formatter = (value: number) => string;

interface ChartTooltipProps extends TooltipProps<ValueType, NameType> {
  /** Override the tooltip title. If omitted, uses the `fullName` on the first
   * payload item (preferred — avoids truncated axis labels) or falls back to `label`. */
  titleKey?: string;
  /** How to render each value. Defaults to currency. */
  format?: Formatter;
  /** Optional footer renderer given the full payload array. */
  footer?: (
    items: { name: string; value: number; color: string; payload: Record<string, unknown> }[],
  ) => React.ReactNode;
}

/**
 * Consistently styled tooltip for every chart.
 * - Uses the `fullName` field from the chart item (if present) for the title so
 *   truncated axis labels never leak into the tooltip.
 * - Strongly typed — replaces the `any`-typed CustomTooltip that used to live
 *   in each chart component.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  titleKey,
  format = formatCurrency,
  footer,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const first = payload[0].payload as Record<string, unknown> | undefined;
  const titleFromPayload = titleKey && first ? first[titleKey] : first?.fullName;
  const title = (titleFromPayload as string) ?? (label as string) ?? "";

  const items = payload.map(p => ({
    name: String(p.name ?? ""),
    value: Number(p.value ?? 0),
    color: String(p.color ?? "#888"),
    payload: (p.payload ?? {}) as Record<string, unknown>,
  }));

  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-sm min-w-[170px]">
      {title && (
        <p className="font-semibold text-foreground mb-2 max-w-[220px] truncate" title={title}>
          {title}
        </p>
      )}
      {items.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground text-xs">{p.name}</span>
          </div>
          <span className="font-mono font-semibold text-foreground text-xs">
            {format(p.value)}
          </span>
        </div>
      ))}
      {footer?.(items)}
    </div>
  );
}
