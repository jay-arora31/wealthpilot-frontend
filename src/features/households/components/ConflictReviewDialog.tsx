import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useConflicts, useResolveConflict } from "../hooks/use-conflicts";
import type { DataConflict } from "@/types";
import { AlertTriangle, Check, X, ArrowRight, Loader2, Quote } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ConflictReviewDialogProps {
  householdId: string;
  pendingCount: number;
}

export function ConflictReviewDialog({
  householdId,
  pendingCount,
}: ConflictReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: conflicts = [], isLoading } = useConflicts(householdId);
  const { mutateAsync: resolve } = useResolveConflict(householdId);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = async (
    conflict: DataConflict,
    action: "accept" | "reject"
  ) => {
    setResolvingId(conflict.id);
    try {
      await resolve({ conflictId: conflict.id, action });
      toast.success(
        action === "accept"
          ? `Applied: ${conflict.field_name.replace(/_/g, " ")}`
          : `Dismissed: ${conflict.field_name.replace(/_/g, " ")}`
      );
    } catch {
      toast.error("Failed to resolve conflict");
    } finally {
      setResolvingId(null);
    }
  };

  if (pendingCount === 0) return null;

  return (
    <div
      className="rounded-lg p-4 flex items-center justify-between"
      style={{
        backgroundColor: "hsl(38 92% 50% / 0.1)",
        border: "1px solid hsl(38 92% 50% / 0.3)",
        color: "hsl(38 92% 15%)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "hsl(38 92% 50% / 0.2)" }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: "hsl(38 92% 35%)" }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "hsl(38 92% 20%)" }}>
            {pendingCount} conflict{pendingCount !== 1 ? "s" : ""} need your review
          </p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(38 92% 30%)" }}>
            Incoming data differs from existing records — accept or reject each change
          </p>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="font-medium"
            style={{
              backgroundColor: "hsl(38 92% 50%)",
              color: "hsl(38 92% 10%)",
              border: "none",
            }}
          >
            Review Changes
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Review Data Conflicts
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Each conflict shows the current value vs the incoming update from Excel or audio.
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          )}

          {!isLoading && conflicts.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              All conflicts have been resolved.
            </p>
          )}

          {!isLoading && conflicts.length > 0 && (
            <div className="space-y-3 py-2">
              {conflicts.map((c: DataConflict) => {
                const isResolving = resolvingId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`border border-border rounded-lg p-4 space-y-3 bg-white transition-opacity ${isResolving ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold capitalize">
                        {c.field_name.replace(/_/g, " ")}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                      >
                        via {c.source}
                      </Badge>
                    </div>

                    {c.source_quote && (
                      <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs">
                        <Quote className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-muted-foreground mb-0.5">
                            Source quote
                          </p>
                          <p className="italic text-foreground">“{c.source_quote}”</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex-1 bg-muted rounded-md px-3 py-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Current value
                        </p>
                        <p className="font-mono font-medium">
                          {c.existing_value ?? "—"}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
                        <p className="text-xs font-medium text-primary mb-1">
                          Incoming value
                        </p>
                        <p className="font-mono font-medium text-primary">
                          {c.incoming_value ?? "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                        disabled={!!resolvingId}
                        onClick={() => handleResolve(c, "reject")}
                      >
                        {isResolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={!!resolvingId}
                        onClick={() => handleResolve(c, "accept")}
                      >
                        {isResolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
