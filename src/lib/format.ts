/**
 * Shared formatting utilities used across charts, tables, and KPI cards.
 * Keeps currency/compact/pluralization rules consistent everywhere.
 */

const fullCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 1,
  notation: "compact",
  compactDisplay: "short",
});

/** Full currency with thousands separators: `$1,234,567` */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return fullCurrency.format(n);
}

/** Compact currency with M/K suffix: `$1.2M`, `$150K`, `$750`. */
export function formatCompact(value: number | string | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  // Intl "compact" uses `K/M/B` already; we just strip trailing `.0`.
  return compactCurrency.format(n).replace(/\.0([KMB])/, "$1");
}

/** Axis-friendly compact currency (no decimals for <1M): `$1.2M` / `$150K`. */
export function formatAxisCurrency(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value)}`;
}

/** Pluralize a noun based on count. `pluralize(1, "household") → "1 household"` */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${word}`;
}

/**
 * Shorten a household name for chart axis labels while preserving the
 * full name for tooltips. Replaces " and " → " & " and caps to 3 words.
 */
export function shortHouseholdName(name: string): string {
  return name.replace(/\s+and\s+/i, " & ").split(" ").slice(0, 3).join(" ");
}
