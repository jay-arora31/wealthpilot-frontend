import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHousehold, useDeleteHousehold } from "../hooks/use-households";
import { ConflictReviewDialog } from "../components/ConflictReviewDialog";
import { FinancialKPICards } from "../components/FinancialKPICards";
import { MembersTable } from "../components/MembersTable";
import { AccountsTable } from "../components/AccountsTable";
import { BankDetailsTable } from "../components/BankDetailsTable";
import { AudioUploadDialog } from "../components/AudioUploadDialog";
import { EditHouseholdDialog } from "../components/EditHouseholdDialog";
import { Target, Settings2, Users, Landmark, Building2, Trash2, Loader2, ArrowLeft } from "lucide-react";

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-11 h-11 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl w-full" />
    </div>
  );
}

export function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: household, isLoading, isError } = useHousehold(id ?? "");
  const deleteHousehold = useDeleteHousehold();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !household) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4">
        <p className="text-sm font-semibold text-destructive">Household not found</p>
        <Link to="/" className="text-sm text-primary hover:underline font-medium">Back to Households</Link>
      </div>
    );
  }

  const tabItems = [
    { value: "members",  label: "Members",      icon: Users,     count: household.members.length },
    { value: "accounts", label: "Accounts",     icon: Landmark,  count: household.financial_accounts.length },
    { value: "bank",     label: "Bank Details", icon: Building2, count: household.bank_details.length },
  ];

  const initials = household.name
    .split(" ").filter(Boolean).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  const hasGoals = !!household.goals;
  const hasPrefs = !!household.preferences;

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-white hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
            <span className="text-sm font-extrabold tracking-tight">{initials}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground leading-tight truncate">{household.name}</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {household.members.length} member{household.members.length !== 1 ? "s" : ""}
              {" · "}{household.financial_accounts.length} account{household.financial_accounts.length !== 1 ? "s" : ""}
              {household.expense_range ? ` · ${household.expense_range}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <EditHouseholdDialog household={household} />
          <Button variant="outline" size="sm"
            className="h-9 px-4 text-[13px] gap-1.5 text-destructive border-destructive/25 hover:bg-destructive/5 hover:text-destructive"
            onClick={() => setShowDelete(true)}>
            <Trash2 className="w-3.5 h-3.5" />Delete
          </Button>
          <AudioUploadDialog householdId={household.id} />
        </div>
      </div>

      {/* ── Delete confirm ───────────────────────────────────── */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Household</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete <strong>{household.name}</strong> and all associated data? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={async () => { await deleteHousehold.mutateAsync(household.id); navigate("/"); }}>
              {deleteHousehold.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Conflict banner ─────────────────────────────────── */}
      {household.pending_conflict_count > 0 && (
        <ConflictReviewDialog householdId={household.id} pendingCount={household.pending_conflict_count} />
      )}

      {/* ── KPI cards ───────────────────────────────────────── */}
      <FinancialKPICards household={household} />

      {/* ── Main card: Goals/Prefs + Tabs + Tables ──────────── */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">

        {/* Goals / Preferences */}
        {(hasGoals || hasPrefs) && (
          <div className="border-b border-border">
            {hasGoals && (
              <div className={`flex items-start gap-4 px-6 py-3.5 ${hasGoals && hasPrefs ? "border-b border-border/60" : ""}`}>
                <div className="flex items-center gap-2 pt-0.5 shrink-0 w-32">
                  <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Goals</span>
                </div>
                <p className="text-[13px] text-foreground/75 leading-relaxed">{household.goals}</p>
              </div>
            )}
            {hasPrefs && (
              <div className="flex items-start gap-4 px-6 py-3.5">
                <div className="flex items-center gap-2 pt-0.5 shrink-0 w-32">
                  <Settings2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Preferences</span>
                </div>
                <p className="text-[13px] text-foreground/75 leading-relaxed">{household.preferences}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab bar */}
        <Tabs defaultValue="members">
          <div className="border-b border-border px-3">
            <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none w-full justify-start">
              {tabItems.map(({ value, label, icon: Icon, count }) => (
                <TabsTrigger key={value} value={value}
                  className="relative h-12 px-5 bg-transparent rounded-none border-0 shadow-none gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-[inset_0_-2px_0_0_hsl(var(--primary))]">
                  <Icon className="w-4 h-4" />
                  {label}
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="members" className="mt-0 focus-visible:outline-none">
            <MembersTable members={household.members} householdId={household.id} />
          </TabsContent>
          <TabsContent value="accounts" className="mt-0 focus-visible:outline-none">
            <AccountsTable accounts={household.financial_accounts} householdId={household.id} />
          </TabsContent>
          <TabsContent value="bank" className="mt-0 focus-visible:outline-none">
            <BankDetailsTable bankDetails={household.bank_details} householdId={household.id} />
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
