import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import type { Member } from "@/types";
import { useDeleteMember, useUpdateMember } from "../hooks/use-households";
import { Users, Pencil, Trash2, Loader2 } from "lucide-react";

interface Props {
  members: Member[];
  householdId: string;
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  spouse: "bg-[hsl(172,66%,40%)]/10 text-[hsl(172,66%,35%)] border-[hsl(172,66%,40%)]/20",
  child: "bg-[hsl(217,91%,60%)]/10 text-[hsl(217,70%,45%)] border-[hsl(217,91%,60%)]/20",
  dependent: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,35%)] border-[hsl(38,92%,50%)]/20",
};

function EditMemberDialog({ member, householdId, onClose }: { member: Member; householdId: string; onClose: () => void }) {
  const update = useUpdateMember(householdId);
  const [form, setForm] = useState({
    name: member.name ?? "",
    date_of_birth: member.date_of_birth ?? "",
    email: member.email ?? "",
    phone: member.phone ?? "",
    member_relationship: member.member_relationship ?? "",
    address: member.address ?? "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    await update.mutateAsync({
      id: member.id,
      data: {
        name: form.name || undefined,
        date_of_birth: form.date_of_birth || null,
        email: form.email || null,
        phone: form.phone || null,
        member_relationship: form.member_relationship || null,
        address: form.address || null,
      },
    });
    onClose();
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-base font-semibold">Edit Member</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</Label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date of Birth</Label>
            <Input value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Relationship</Label>
            <Input value={form.member_relationship} onChange={e => set("member_relationship", e.target.value)} placeholder="e.g. Spouse" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</Label>
            <Input value={form.email} onChange={e => set("email", e.target.value)} type="email" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</Label>
            <Input value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</Label>
            <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street, City, State ZIP" />
          </div>
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={onClose} disabled={update.isPending}>Cancel</Button>
        <Button onClick={handleSave} disabled={update.isPending || !form.name.trim()} className="gap-1.5">
          {update.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function MembersTable({ members, householdId }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMember = useDeleteMember(householdId);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Users className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No members on record</p>
        <p className="text-xs text-muted-foreground/70">Members are added automatically when you upload Excel data</p>
      </div>
    );
  }

  const editingMember = members.find(m => m.id === editingId);
  const deletingMember = members.find(m => m.id === deletingId);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-6 h-11">Name</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-11">Date of Birth</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-11">Email</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-11">Phone</TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-11">Relationship</TableHead>
            <TableHead className="w-24 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-5 h-11">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => {
            const relKey = m.member_relationship?.toLowerCase() ?? "";
            const relColor = RELATIONSHIP_COLORS[relKey] ?? "bg-muted text-muted-foreground border-border";
            return (
              <TableRow key={m.id} className="odd:bg-white even:bg-muted/20 hover:bg-primary/4 transition-colors group">
                <TableCell className="font-semibold text-[13px] pl-6 py-3.5">{m.name}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground py-3.5">{m.date_of_birth ?? "—"}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground py-3.5">{m.email ?? "—"}</TableCell>
                <TableCell className="text-[13px] font-mono tabular-nums text-muted-foreground py-3.5">{m.phone ?? "—"}</TableCell>
                <TableCell className="py-3.5">
                  {m.member_relationship ? (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${relColor}`}>
                      {m.member_relationship}
                    </span>
                  ) : <span className="text-muted-foreground text-[13px]">—</span>}
                </TableCell>
                <TableCell className="py-3.5 pr-5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => setEditingId(m.id)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeletingId(m.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit dialog */}
      <Dialog open={!!editingId} onOpenChange={o => !o && setEditingId(null)}>
        {editingMember && (
          <EditMemberDialog
            member={editingMember}
            householdId={householdId}
            onClose={() => setEditingId(null)}
          />
        )}
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={o => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingMember?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={async () => {
                if (deletingId) await deleteMember.mutateAsync(deletingId);
                setDeletingId(null);
              }}
            >
              {deleteMember.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
