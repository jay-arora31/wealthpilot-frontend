import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import type { FinancialAccount } from "@/types";
import { useDeleteAccount, useUpdateAccount } from "../hooks/use-households";
import { Landmark, Pencil, Trash2, Loader2 } from "lucide-react";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

interface Props {
  accounts: FinancialAccount[];
  householdId: string;
}

function EditAccountDialog({
  account, householdId, onClose,
}: { account: FinancialAccount; householdId: string; onClose: () => void }) {
  const update = useUpdateAccount(householdId);
  const [form, setForm] = useState({
    account_number: account.account_number ?? "",
    custodian: account.custodian ?? "",
    account_type: account.account_type ?? "",
    account_value: account.account_value != null ? String(account.account_value) : "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    const val = parseFloat(form.account_value.replace(/,/g, "").replace(/\$/g, ""));
    await update.mutateAsync({
      id: account.id,
      data: {
        account_number: form.account_number || null,
        custodian: form.custodian || null,
        account_type: form.account_type || null,
        account_value: isNaN(val) ? null : val,
      },
    });
    onClose();
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-base font-semibold">Edit Account</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account #</Label>
            <Input value={form.account_number} onChange={e => set("account_number", e.target.value)} placeholder="e.g. 4521-XXXX" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custodian</Label>
            <Input value={form.custodian} onChange={e => set("custodian", e.target.value)} placeholder="e.g. Fidelity" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Type</Label>
            <Input value={form.account_type} onChange={e => set("account_type", e.target.value)} placeholder="e.g. Individual" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Value</Label>
            <Input value={form.account_value} onChange={e => set("account_value", e.target.value)} placeholder="e.g. 250000" />
          </div>
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

export function AccountsTable({ accounts, householdId }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteAccount = useDeleteAccount(householdId);

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Landmark className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No accounts on record</p>
        <p className="text-xs text-muted-foreground/70">Financial accounts appear here once imported from Excel</p>
      </div>
    );
  }

  const editingAccount = accounts.find(a => a.id === editingId);
  const deletingAccount = accounts.find(a => a.id === deletingId);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-6 h-11">Account #</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-11">Custodian</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-11">Type</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right h-11">Value</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-11">Ownership</TableHead>
            <TableHead className="w-24 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-5 h-11">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((acc) => (
            <TableRow key={acc.id} className="odd:bg-white even:bg-muted/20 hover:bg-primary/4 transition-colors group">
              <TableCell className="font-mono tabular-nums text-[13px] pl-6 py-3.5 text-muted-foreground">
                {acc.account_number ?? "—"}
              </TableCell>
              <TableCell className="font-semibold text-[13px] py-3.5">{acc.custodian ?? "—"}</TableCell>
              <TableCell className="py-3.5">
                {acc.account_type ? (
                  <Badge variant="secondary" className="text-xs">{acc.account_type}</Badge>
                ) : <span className="text-muted-foreground text-[13px]">—</span>}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums font-semibold text-[13px] py-3.5">
                {acc.account_value != null ? fmt.format(Number(acc.account_value))
                  : <span className="text-muted-foreground font-normal">—</span>}
              </TableCell>
              <TableCell className="py-3.5">
                {acc.ownerships.length === 0 ? (
                  <span className="text-muted-foreground text-[13px]">—</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {acc.ownerships.map((o) => (
                      <span key={o.id}
                        className="inline-flex items-center gap-1 bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {o.member_name ?? "Unknown"}
                        {o.ownership_percentage != null && (
                          <span className="font-mono font-semibold text-foreground">{Number(o.ownership_percentage)}%</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="py-3.5 pr-5">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setEditingId(acc.id)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeletingId(acc.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editingId} onOpenChange={o => !o && setEditingId(null)}>
        {editingAccount && (
          <EditAccountDialog account={editingAccount} householdId={householdId} onClose={() => setEditingId(null)} />
        )}
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={o => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              <strong>{deletingAccount?.account_type ?? deletingAccount?.account_number ?? "account"}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={async () => {
                if (deletingId) await deleteAccount.mutateAsync(deletingId);
                setDeletingId(null);
              }}
            >
              {deleteAccount.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
