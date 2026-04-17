import { useRef, useState } from "react";
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
import { Mic, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AudioUploadDialogProps {
  householdId: string;
}

export function AudioUploadDialog({ householdId }: AudioUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { start, reset: resetPoller, job, isPolling, isDone, isFailed } = useJobPoller({
    // Auto-invalidate the specific household detail page when audio job completes
    invalidateKeys: [["households", householdId]],
  });

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const { job_id } = await householdApi.uploadAudio(householdId, file);
      start(job_id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      toast.error("Could not start audio processing");
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
  };

  const showDropzone = !uploading && !isPolling && !isDone && !isFailed && !error;
  const showProgress = uploading || isPolling;

  // Current pipeline step label for display
  const currentStep = job?.steps?.[job.steps.length - 1] ?? "Initialising…";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mic className="w-4 h-4" />
          Upload Audio
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-tight">
            Upload Audio Recording
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Whisper transcribes the recording, then GPT-4o extracts financial updates.
          </p>
        </DialogHeader>

        {/* ── Processing / Polling ── */}
        {showProgress && (
          <div className="py-2 space-y-4">
            {/* Pipeline stages */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative">
                <Mic className="w-4.5 h-4.5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                  <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Processing audio…</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">{currentStep}</p>
              </div>
            </div>

            {/* AI pipeline stage indicators */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Upload", done: (job?.steps?.length ?? 0) >= 1 },
                { label: "Transcribe", done: (job?.steps ?? []).some((s) => s.includes("Transcription complete") || s.includes("words")) },
                { label: "Extract", done: (job?.steps ?? []).some((s) => s.includes("Extraction complete") || s.includes("Done")) },
              ].map((stage) => (
                <div
                  key={stage.label}
                  className={`rounded-lg border px-3 py-2 text-center transition-all ${
                    stage.done
                      ? "border-primary/30 bg-primary/8"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {stage.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                    )}
                  </div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${stage.done ? "text-primary" : "text-muted-foreground"}`}>
                    {stage.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Live step log */}
            <div className="bg-muted/50 border border-border rounded-xl p-3 max-h-44 overflow-y-auto space-y-1.5">
              {(job?.steps ?? []).length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Waiting for response…
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

            {/* Animated bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-1/2 transition-all" />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Transcription may take 15–30 seconds depending on file length
            </p>
          </div>
        )}

        {/* ── Done ── */}
        {isDone && job?.result && (() => {
          const r = job.result as { transcript_text: string; updates_applied: number; conflicts_created: number };
          return (
            <div className="py-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Analysis complete!</p>
                  <p className="text-xs text-muted-foreground">Financial data extracted successfully</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Updates Applied", value: r.updates_applied, style: "stat-card-green", color: "text-primary" },
                  { label: "Conflicts Found", value: r.conflicts_created, style: "stat-card-amber", color: "text-[hsl(38,80%,42%)]" },
                ].map((s) => (
                  <div key={s.label} className={`${s.style} border rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold font-mono tabular-nums ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {r.transcript_text && (
                <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Transcript
                  </p>
                  <p className="text-sm text-foreground/70 leading-relaxed line-clamp-4">
                    {r.transcript_text.slice(0, 400)}
                    {r.transcript_text.length > 400 ? "…" : ""}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} className="flex-1 text-sm">
                  Upload Another
                </Button>
                <Button
                  className="flex-1 text-sm bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                >
                  View Updates
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
                <p className="text-xs text-muted-foreground">{job?.error ?? "Unknown error"}</p>
              </div>
            </div>
            {job && job.steps.length > 0 && (
              <div className="bg-muted/40 rounded-lg p-3 space-y-1 max-h-32 overflow-y-auto text-xs text-muted-foreground">
                {job.steps.map((s, i) => <p key={i}>{s}</p>)}
              </div>
            )}
            <Button variant="outline" onClick={reset} className="w-full text-sm">
              Try Again
            </Button>
          </div>
        )}

        {/* ── Error ── */}
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
              <Mic className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold">Drop your audio file here</p>
              <p className="text-xs text-muted-foreground">
                or{" "}
                <span className="text-primary font-semibold underline underline-offset-2">
                  click to browse
                </span>{" "}
                — .mp3, .wav, .m4a, .webm
              </p>
            </div>
            <p className="text-xs text-muted-foreground/60">
              Processing runs in the background — you'll see live progress
            </p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".mp3,.wav,.m4a,.webm,.mp4,.ogg"
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
