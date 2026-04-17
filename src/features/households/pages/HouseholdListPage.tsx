import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExcelUploadDialog } from "../components/ExcelUploadDialog";
import { useHouseholds, useDeleteHousehold } from "../hooks/use-households";
import type { HouseholdSummary } from "@/types";
import {
  Users,
  ArrowRight,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Search,
  Trash2,
  Loader2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 10;

type SortKey = "name" | "income" | "net_worth" | "member_count";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: `${SortKey}-${SortDir}`; label: string }[] = [
  { value: "name-asc",         label: "Name (A → Z)" },
  { value: "name-desc",        label: "Name (Z → A)" },
  { value: "income-desc",      label: "Income (highest first)" },
  { value: "income-asc",       label: "Income (lowest first)" },
  { value: "net_worth-desc",   label: "Net Worth (highest first)" },
  { value: "net_worth-asc",    label: "Net Worth (lowest first)" },
  { value: "member_count-desc", label: "Members (most first)" },
  { value: "member_count-asc",  label: "Members (fewest first)" },
];

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  notation: "compact",
  compactDisplay: "short",
});
const fmtFull = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-7 text-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
          <FileSpreadsheet className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-primary flex items-center justify-center shadow-lg">
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          No households yet
        </h2>
        <p className="text-sm text-muted-foreground max-w-[360px] leading-relaxed">
          Upload an Excel file to get started. Our AI will automatically detect
          column layouts and extract household financial data across all sheets.
        </p>
      </div>
      <ExcelUploadDialog />
      <p className="text-xs text-muted-foreground/60">
        Supports .xlsx · .xls · Multi-sheet workbooks
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[92px] rounded-xl" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-3.5 bg-muted/30 border-b border-border">
          <Skeleton className="h-4 w-48" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-border last:border-0">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3 ml-1 text-primary" />
    : <ChevronDown className="w-3 h-3 ml-1 text-primary" />;
}

export function HouseholdListPage() {
  const navigate = useNavigate();
  const { data: households, isLoading, isError } = useHouseholds();
  const deleteHousehold = useDeleteHousehold();
  const [search, setSearch] = useState("");
  const [deletingHousehold, setDeletingHousehold] = useState<HouseholdSummary | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const sortValue = `${sortKey}-${sortDir}` as `${SortKey}-${SortDir}`;

  function handleSortSelect(val: string) {
    const [key, dir] = val.split("-") as [SortKey, SortDir];
    setSortKey(key);
    setSortDir(dir);
  }

  function handleColSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(col);
      setSortDir(col === "name" || col === "member_count" ? "asc" : "desc");
    }
  }

  const filtered = useMemo(() => {
    const list = (households ?? []).filter((h: HouseholdSummary) =>
      h.name.toLowerCase().includes(search.toLowerCase().trim())
    );
    return [...list].sort((a: HouseholdSummary, b: HouseholdSummary) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "income") {
        cmp = (Number(a.income) || 0) - (Number(b.income) || 0);
      } else if (sortKey === "net_worth") {
        cmp = (Number(a.net_worth) || 0) - (Number(b.net_worth) || 0);
      } else if (sortKey === "member_count") {
        cmp = (a.member_count || 0) - (b.member_count || 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [households, search, sortKey, sortDir]);

  // Reset to first page whenever the visible result set changes shape
  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir, pageSize]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = totalItems === 0 ? 0 : (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const pageRows = useMemo(
    () => filtered.slice(startIdx, endIdx),
    [filtered, startIdx, endIdx],
  );

  // Clamp page if the total shrinks (e.g. after a delete)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const totalIncome = households?.reduce(
    (s: number, h: HouseholdSummary) => s + (Number(h.income) || 0), 0
  ) ?? 0;
  const totalNW = households?.reduce(
    (s: number, h: HouseholdSummary) => s + (Number(h.net_worth) || 0), 0
  ) ?? 0;
  const totalMembers = households?.reduce(
    (s: number, h: HouseholdSummary) => s + (h.member_count || 0), 0
  ) ?? 0;

  const statCards = [
    {
      label: "Total Households",
      value: String(households?.length ?? 0),
      icon: Users,
      style: "stat-card-green",
      iconColor: "text-primary",
      iconBg: "bg-primary/15",
    },
    {
      label: "Portfolio Income",
      value: fmt.format(totalIncome),
      icon: DollarSign,
      style: "stat-card-teal",
      iconColor: "text-[hsl(172,66%,38%)]",
      iconBg: "bg-[hsl(172,66%,40%)]/15",
    },
    {
      label: "Total Net Worth",
      value: fmt.format(totalNW),
      icon: Wallet,
      style: "stat-card-blue",
      iconColor: "text-[hsl(217,80%,55%)]",
      iconBg: "bg-[hsl(217,91%,60%)]/15",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Households</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {households && households.length > 0
              ? `${households.length} household${households.length !== 1 ? "s" : ""} · ${totalMembers} member${totalMembers !== 1 ? "s" : ""} total`
              : "Manage client household data and financial profiles"}
          </p>
        </div>
        {households && households.length > 0 && <ExcelUploadDialog />}
      </div>

      {/* Loading */}
      {isLoading && <LoadingSkeleton />}

      {/* Error */}
      {isError && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-destructive">Connection failed</p>
          <p className="text-xs text-muted-foreground mt-1">
            Could not reach the backend. Make sure it's running on port 8000.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && households?.length === 0 && <EmptyState />}

      {/* Stats + Table */}
      {!isLoading && !isError && households && households.length > 0 && (
        <div className="space-y-6">

          {/* KPI stat row */}
          <div className="grid grid-cols-3 gap-5">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`${s.style} border rounded-xl p-5 flex items-start justify-between card-hover`}
                >
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {s.label}
                    </p>
                    <p className="text-2xl font-bold font-mono tabular-nums mt-2 text-foreground">
                      {s.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            {/* Table header bar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-muted/20 gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Client Households
                </span>
                <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                  {search ? `${filtered.length} / ${households.length}` : households.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-52">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search households…"
                    className="pl-8 h-8 text-sm bg-white border-border"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium whitespace-nowrap">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuRadioGroup value={sortValue} onValueChange={handleSortSelect}>
                      {SORT_OPTIONS.map(opt => (
                        <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead
                    className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-6 py-3 cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleColSort("name")}
                  >
                    <span className="inline-flex items-center">
                      Household
                      <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </TableHead>
                  <TableHead
                    className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right py-3 cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleColSort("income")}
                  >
                    <span className="inline-flex items-center justify-end w-full">
                      Annual Income
                      <SortIcon col="income" sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </TableHead>
                  <TableHead
                    className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right py-3 cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleColSort("net_worth")}
                  >
                    <span className="inline-flex items-center justify-end w-full">
                      Net Worth
                      <SortIcon col="net_worth" sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </TableHead>
                  <TableHead
                    className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center py-3 w-24 cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleColSort("member_count")}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      Members
                      <SortIcon col="member_count" sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </TableHead>
                  <TableHead className="w-16 py-3" />
                  <TableHead className="w-10 py-3" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {totalItems === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-sm text-muted-foreground">
                      No households match &ldquo;{search}&rdquo;
                    </TableCell>
                  </TableRow>
                )}
                {pageRows.map((h: HouseholdSummary) => (
                  <TableRow
                    key={h.id}
                    className="cursor-pointer hover:bg-primary/3 transition-colors border-b border-border/60 last:border-0 group"
                    onClick={() => navigate(`/households/${h.id}`)}
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {h.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{h.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {h.member_count} member{h.member_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <span className="text-sm font-mono tabular-nums font-medium text-foreground">
                        {h.income != null ? fmtFull.format(Number(h.income)) : (
                          <span className="text-muted-foreground/50 font-normal">—</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <span className="text-sm font-mono tabular-nums font-medium text-foreground">
                        {h.net_worth != null ? fmtFull.format(Number(h.net_worth)) : (
                          <span className="text-muted-foreground/50 font-normal">—</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold text-foreground">
                        {h.member_count}
                      </span>
                    </TableCell>
                    <TableCell className="py-4" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeletingHousehold(h)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                    <TableCell className="pr-5 py-4">
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination footer */}
            {totalItems > 0 && (
              <div className="flex items-center justify-between gap-4 px-6 py-3 border-t border-border bg-muted/20 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {startIdx + 1}–{endIdx}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {totalItems}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Rows per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Rows per page</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 gap-1 text-xs font-medium tabular-nums"
                        >
                          {pageSize}
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[72px]">
                        <DropdownMenuRadioGroup
                          value={String(pageSize)}
                          onValueChange={(v) => setPageSize(Number(v))}
                        >
                          {PAGE_SIZE_OPTIONS.map((size) => (
                            <DropdownMenuRadioItem
                              key={size}
                              value={String(size)}
                              className="text-xs tabular-nums"
                            >
                              {size}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Page counter */}
                  <span className="text-muted-foreground tabular-nums">
                    Page{" "}
                    <span className="font-semibold text-foreground">
                      {safePage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {totalPages}
                    </span>
                  </span>

                  {/* Nav buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPage(1)}
                      disabled={safePage === 1}
                      aria-label="First page"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPage(totalPages)}
                      disabled={safePage === totalPages}
                      aria-label="Last page"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deletingHousehold} onOpenChange={o => !o && setDeletingHousehold(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Household</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>{deletingHousehold?.name}</strong> and all associated data?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={async () => {
                if (deletingHousehold) await deleteHousehold.mutateAsync(deletingHousehold.id);
                setDeletingHousehold(null);
              }}
            >
              {deleteHousehold.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
