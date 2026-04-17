import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateHousehold } from "../hooks/use-households";
import type { HouseholdDetail } from "@/types";
import { Pencil, Loader2 } from "lucide-react";

interface Props {
  household: HouseholdDetail;
}

export function EditHouseholdDialog({ household }: Props) {
  const [open, setOpen] = useState(false);
  const update = useUpdateHousehold(household.id);

  const [form, setForm] = useState({
    name: household.name ?? "",
    income: household.income != null ? String(household.income) : "",
    net_worth: household.net_worth != null ? String(household.net_worth) : "",
    liquid_net_worth: household.liquid_net_worth != null ? String(household.liquid_net_worth) : "",
    expense_range: household.expense_range ?? "",
    tax_bracket: household.tax_bracket ?? "",
    risk_tolerance: household.risk_tolerance ?? "",
    time_horizon: household.time_horizon ?? "",
    goals: household.goals ?? "",
    preferences: household.preferences ?? "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function toDecimalOrNull(v: string) {
    const n = parseFloat(v.replace(/,/g, "").replace(/\$/g, ""));
    return isNaN(n) ? null : n;
  }

  function handleOpen() {
    setForm({
      name: household.name ?? "",
      income: household.income != null ? String(household.income) : "",
      net_worth: household.net_worth != null ? String(household.net_worth) : "",
      liquid_net_worth: household.liquid_net_worth != null ? String(household.liquid_net_worth) : "",
      expense_range: household.expense_range ?? "",
      tax_bracket: household.tax_bracket ?? "",
      risk_tolerance: household.risk_tolerance ?? "",
      time_horizon: household.time_horizon ?? "",
      goals: household.goals ?? "",
      preferences: household.preferences ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    await update.mutateAsync({
      name: form.name || undefined,
      income: toDecimalOrNull(form.income),
      net_worth: toDecimalOrNull(form.net_worth),
      liquid_net_worth: toDecimalOrNull(form.liquid_net_worth),
      expense_range: form.expense_range || null,
      tax_bracket: form.tax_bracket || null,
      risk_tolerance: form.risk_tolerance || null,
      time_horizon: form.time_horizon || null,
      goals: form.goals || null,
      preferences: form.preferences || null,
    });
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className="gap-1.5">
        <Pencil className="w-3.5 h-3.5" />
        Edit Household
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit Household</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Household Name</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Smith Family" />
            </div>

            {/* Financial figures */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Annual Income</Label>
                <Input value={form.income} onChange={e => set("income", e.target.value)} placeholder="e.g. 150000" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Worth</Label>
                <Input value={form.net_worth} onChange={e => set("net_worth", e.target.value)} placeholder="e.g. 1200000" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Liquid Net Worth</Label>
                <Input value={form.liquid_net_worth} onChange={e => set("liquid_net_worth", e.target.value)} placeholder="e.g. 300000" />
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expense Range</Label>
                <Input value={form.expense_range} onChange={e => set("expense_range", e.target.value)} placeholder="e.g. $50k-$100k" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax Bracket</Label>
                <Input value={form.tax_bracket} onChange={e => set("tax_bracket", e.target.value)} placeholder="e.g. 24%" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Tolerance</Label>
                <Input value={form.risk_tolerance} onChange={e => set("risk_tolerance", e.target.value)} placeholder="e.g. Moderate" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Horizon</Label>
                <Input value={form.time_horizon} onChange={e => set("time_horizon", e.target.value)} placeholder="e.g. 10-15 years" />
              </div>
            </div>

            {/* Text areas */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goals</Label>
              <Textarea
                value={form.goals}
                onChange={e => set("goals", e.target.value)}
                placeholder="Client goals and objectives…"
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preferences</Label>
              <Textarea
                value={form.preferences}
                onChange={e => set("preferences", e.target.value)}
                placeholder="Investment preferences…"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={update.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={update.isPending || !form.name.trim()} className="gap-1.5">
              {update.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
