import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { BankDetail } from "@/types";
import { useDeleteBankDetail, useUpdateBankDetail } from "../hooks/use-households";
import { Building2, Pencil, Trash2, Loader2, Search, X } from "lucide-react";

interface Props {
  bankDetails: BankDetail[];
  householdId: string;
}

function EditBankDialog({
  detail, householdId, onClose,
}: { detail: BankDetail; householdId: string; onClose: () => void }) {
  const update = useUpdateBankDetail(householdId);
  const [form, setForm] = useState({
    bank_name: detail.bank_name ?? "",
    account_number: detail.account_number ?? "",
    routing_number: detail.routing_number ?? "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    await update.mutateAsync({
      id: detail.id,
      data: {
        bank_name: form.bank_name || null,
        account_number: form.account_number || null,
        routing_number: form.routing_number || null,
      },
    });
    onClose();
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-base font-semibold">Edit Bank Detail</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Name</Label>
          <Input value={form.bank_name} onChange={e => set("bank_name", e.target.value)} placeholder="e.g. Chase" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Number</Label>
          <Input value={form.account_number} onChange={e => set("account_number", e.target.value)} placeholder="e.g. XXXX-1234" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Routing Number</Label>
          <Input value={form.routing_number} onChange={e => set("routing_number", e.target.value)} placeholder="9 digits" />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={onClose} disabled={update.isPending}>Cancel</Button>
        <Button onClick={handleSave} disabled={update.isPending} className="gap-1.5">
          {update.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function BankDetailsTable({ bankDetails, householdId }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deleteBank = useDeleteBankDetail(householdId);

  if (bankDetails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Building2 className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No bank details on record</p>
        <p className="text-xs text-muted-foreground/70">Banking information appears here once imported from Excel</p>
      </div>
    );
  }

  const query = search.trim().toLowerCase();
  const filtered = query
    ? bankDetails.filter(bd =>
        (bd.bank_name ?? "").toLowerCase().includes(query) ||
        (bd.account_number ?? "").toLowerCase().includes(query) ||
        (bd.routing_number ?? "").toLowerCase().includes(query)
      )
    : bankDetails;

  const editingDetail = bankDetails.find(b => b.id === editingId);
  const deletingDetail = bankDetails.find(b => b.id === deletingId);

  return (
    <>
      <div className="px-6 py-3 border-b border-border/50">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by bank, account, or routing…"
            className="pl-9 pr-9 h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-6 h-11">Bank Name</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-11">Account Number</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-11">Routing Number</TableHead>
            <TableHead className="w-24 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-5 h-11">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search className="w-5 h-5 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No results for &ldquo;{search}&rdquo;</p>
                  <button onClick={() => setSearch("")} className="text-xs text-primary hover:underline">Clear search</button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((bd) => (
              <TableRow key={bd.id} className="odd:bg-white even:bg-muted/20 hover:bg-primary/4 transition-colors group">
                <TableCell className="font-semibold text-[13px] pl-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    {bd.bank_name ?? "—"}
                  </div>
                </TableCell>
                <TableCell className="font-mono tabular-nums text-[13px] text-muted-foreground py-3.5">
                  {bd.account_number ?? "—"}
                </TableCell>
                <TableCell className="font-mono tabular-nums text-[13px] text-muted-foreground py-3.5">
                  {bd.routing_number ?? "—"}
                </TableCell>
                <TableCell className="py-3.5 pr-5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => setEditingId(bd.id)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeletingId(bd.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!editingId} onOpenChange={o => !o && setEditingId(null)}>
        {editingDetail && (
          <EditBankDialog detail={editingDetail} householdId={householdId} onClose={() => setEditingId(null)} />
        )}
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={o => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Detail</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the banking record for{" "}
              <strong>{deletingDetail?.bank_name ?? "this bank"}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={async () => {
                if (deletingId) await deleteBank.mutateAsync(deletingId);
                setDeletingId(null);
              }}
            >
              {deleteBank.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
