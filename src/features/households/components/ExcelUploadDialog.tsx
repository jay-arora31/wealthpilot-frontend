import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { householdApi } from "@/lib/api";
import { useJobPoller } from "../hooks/use-job-poller";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  FileUp,
  Loader2,
  Sparkles,
  ArrowRight,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export function ExcelUploadDialog() {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { start, reset: resetPoller, job, isPolling, isDone, isFailed } =
    useJobPoller({ jobType: "excel" });

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    setStartedAt(Date.now());
    try {
      const { job_id } = await householdApi.uploadExcel(file);
      start(job_id, { filename: file.name });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      toast.error("Could not start upload");
      setStartedAt(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    resetPoller();
    setError(null);
    setUploading(false);
    setStartedAt(null);
  };

  // Auto-scroll live step log as new entries arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [job?.steps?.length]);

  const showDropzone =
    !uploading && !isPolling && !isDone && !isFailed && !error;
  const showProgress = uploading || isPolling;
  const elapsed = useElapsed(startedAt, showProgress);

  const handleOpenChange = (v: boolean) => {
    // While processing, don't destroy progress — just hide the modal.
    // The header pill continues to reflect live status.
    if (!v && showProgress) {
      setOpen(false);
      return;
    }
    setOpen(v);
    if (!v) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Upload className="w-4 h-4" />
          Upload Excel
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-lg shadow-lg"
        onInteractOutside={(e) => {
          if (showProgress) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (showProgress) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-tight">
            Import from Excel
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload a .xlsx or .xls file — AI maps columns and extracts data automatically.
          </p>
        </DialogHeader>

        {/* ── Processing / Polling ── */}
        {showProgress && (
          <div className="py-2 space-y-4">
            {/* Progress header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Loader2 className="w-4.5 h-4.5 text-primary animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Processing your file…
                </p>
                <p className="text-xs text-muted-foreground">
                  AI is analysing your data in the background
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Step
                </p>
                <p className="text-sm font-bold font-mono tabular-nums text-primary leading-none">
                  {job?.steps?.length ?? 0}
                </p>
                <p className="text-[10px] font-mono tabular-nums text-muted-foreground mt-1">
                  {elapsed}
                </p>
              </div>
            </div>

            {/* Live step log */}
            <div
              ref={logRef}
              className="bg-muted/50 border border-border rounded-xl p-4 max-h-52 overflow-y-auto space-y-1.5"
            >
              {(job?.steps ?? []).length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  Initialising…
                </div>
              ) : (
                (job?.steps ?? []).map((step, i) => {
                  const isLast = i === (job?.steps.length ?? 0) - 1;
                  const isRunning = isLast && job?.status === "running";
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      {isRunning ? (
                        <Loader2 className="w-3 h-3 text-primary animate-spin shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      )}
                      <span className={isLast ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {step}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Animated progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-muted-foreground">
                Safe to close this window — progress continues in the header.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs shrink-0"
                onClick={() => setOpen(false)}
              >
                <EyeOff className="w-3 h-3" />
                Hide
              </Button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {isDone && job?.result && (() => {
          const r = job.result as {
            created: number;
            enriched: number;
            conflicts: number;
            column_mappings?: {
              sheet: string;
              mappings: { field: string; header: string; column_index: number }[];
            }[];
          };
          const sheets = r.column_mappings ?? [];
          const totalMapped = sheets.reduce((sum, s) => sum + s.mappings.length, 0);
          return (
            <div className="py-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Import complete!</p>
                  <p className="text-xs text-muted-foreground">
                    Your households have been updated
                  </p>
                </div>
              </div>

              {/* Result stat grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Created", value: r.created, style: "stat-card-green", color: "text-primary" },
                  { label: "Enriched", value: r.enriched, style: "stat-card-teal", color: "text-[hsl(172,60%,38%)]" },
                  { label: "Conflicts", value: r.conflicts, style: "stat-card-amber", color: "text-[hsl(38,80%,42%)]" },
                ].map((s) => (
                  <div key={s.label} className={`${s.style} border rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold font-mono tabular-nums ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI column mapping — what the AI decided */}
              {totalMapped > 0 && (
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg px-3 py-2 hover:from-primary/15 hover:to-primary/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">
                          AI mapped {totalMapped} column{totalMapped !== 1 ? "s" : ""}
                          {sheets.length > 1 && ` across ${sheets.length} sheets`}
                        </span>
                      </div>
                      <span className="text-[10px] text-primary font-medium group-open:hidden">
                        Review →
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium hidden group-open:inline">
                        Hide
                      </span>
                    </div>
                  </summary>
                  <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
                    {sheets.map((sheet) => (
                      <div key={sheet.sheet} className="bg-muted/40 rounded-lg p-3">
                        {sheets.length > 1 && (
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Sheet: {sheet.sheet}
                          </p>
                        )}
                        <div className="space-y-1">
                          {sheet.mappings.map((m) => (
                            <div
                              key={`${sheet.sheet}-${m.field}`}
                              className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-background/60"
                            >
                              <span className="font-mono text-[10px] bg-background border rounded px-1.5 py-0.5 text-muted-foreground truncate max-w-[45%]">
                                {m.header}
                              </span>
                              <ArrowRight className="w-3 h-3 text-primary/60 shrink-0" />
                              <span className="font-semibold text-foreground text-[11px] truncate">
                                {m.field}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground px-1 italic">
                      Mappings are chosen by AI + validated against actual column values.
                    </p>
                  </div>
                </details>
              )}

              {/* Step log — collapsed */}
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground font-medium py-1">
                  View processing log ({job.steps.length} steps)
                </summary>
                <div className="mt-2 bg-muted/40 rounded-lg p-3 space-y-1 max-h-36 overflow-y-auto">
                  {job.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </details>

              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} className="flex-1 text-sm">
                  Import Another
                </Button>
                <Button
                  className="flex-1 text-sm bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                >
                  View Households
                </Button>
              </div>
            </div>
          );
        })()}

        {/* ── Failed ── */}
        {isFailed && (
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-bold text-destructive">Processing failed</p>
                <p className="text-xs text-muted-foreground">Check the log for details</p>
              </div>
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm text-destructive/80">
              {job?.error ?? "Unknown error"}
            </div>
            {job && job.steps.length > 0 && (
              <div className="bg-muted/40 rounded-lg p-3 space-y-1 max-h-36 overflow-y-auto text-xs text-muted-foreground">
                {job.steps.map((s, i) => <p key={i}>{s}</p>)}
              </div>
            )}
            <Button variant="outline" onClick={reset} className="w-full text-sm">
              Try Again
            </Button>
          </div>
        )}

        {/* ── Error (upload itself failed) ── */}
        {error && (
          <div className="py-2 space-y-3">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm text-destructive/80">
              {error}
            </div>
            <Button variant="outline" onClick={reset} className="w-full text-sm">
              Try Again
            </Button>
          </div>
        )}

        {/* ── Drop zone ── */}
        {showDropzone && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200 ${
              dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/30"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold">Drop your Excel file here</p>
              <p className="text-xs text-muted-foreground">
                or{" "}
                <span className="text-primary font-semibold underline underline-offset-2">
                  click to browse
                </span>{" "}
                — .xlsx, .xls
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
              <FileUp className="w-3.5 h-3.5" />
              Multi-sheet workbooks supported
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function useElapsed(startMs: number | null, active: boolean): string {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active || !startMs) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active, startMs]);
  if (!startMs) return "00:00";
  const seconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
