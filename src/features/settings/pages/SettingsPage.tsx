import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useResetAllData } from "../hooks/use-admin";

export function SettingsPage() {
  const [open, setOpen] = useState(false);
  const resetAll = useResetAllData();

  const handleConfirm = async () => {
    try {
      const result = await resetAll.mutateAsync();
      toast.success(
        result.households_deleted > 0
          ? `Deleted ${result.households_deleted} household${result.households_deleted === 1 ? "" : "s"} and all related data.`
          : "Nothing to delete — your workspace was already empty."
      );
      setOpen(false);
    } catch (err) {
      const message =
        (err as { response?: { data?: { detail?: string } }; message?: string })
          ?.response?.data?.detail ??
        (err as Error)?.message ??
        "Failed to delete data.";
      toast.error(message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your workspace preferences and data.
        </p>
      </div>

      {/* Danger zone */}
      <section className="rounded-xl border border-destructive/30 bg-white overflow-hidden">
        <header className="px-6 py-4 border-b border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h2 className="text-sm font-semibold text-destructive">
              Danger zone
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Actions below are permanent and cannot be undone.
          </p>
        </header>

        <div className="px-6 py-5 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Delete all data
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Permanently remove every household, member, financial account,
              bank detail, and conflict record from your workspace. This cannot
              be undone.
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={() => setOpen(true)}
            disabled={resetAll.isPending}
            className="shrink-0"
          >
            {resetAll.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete all data
          </Button>
        </div>
      </section>

      {/* Confirmation dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete every household and all of their
              members, financial accounts, bank details, and conflict records.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetAll.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={resetAll.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {resetAll.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Yes, delete everything"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
