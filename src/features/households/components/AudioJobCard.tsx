import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Mic,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { markJobNotified, useActiveJobs, type ActiveJob } from "../hooks/use-active-jobs";
import { useJobPoller } from "../hooks/use-job-poller";

/**
 * Inline card shown at the top of the Household Detail page whenever an
 * audio-processing job is in flight *for this specific household*.
 *
 * Unlike the global Excel pill in the navbar, audio progress is scoped:
 * the user uploaded a recording for THIS household, so they should see
 * the live pipeline next to the data that is about to change.
 */
interface AudioJobCardProps {
  householdId: string;
}

export function AudioJobCard({ householdId }: AudioJobCardProps) {
  const { jobs } = useActiveJobs();
  const job = jobs.find(
    (j) => j.job_type === "audio" && j.household_id === householdId,
  );

  if (!job) return null;
  return <AudioJobCardInner key={job.job_id} job={job} />;
}

function AudioJobCardInner({ job }: { job: ActiveJob }) {
  const { removeJob } = useActiveJobs();
  const logRef = useRef<HTMLDivElement>(null);
  const {
    job: status,
    isPolling,
    isDone,
    isFailed,
    notFound,
  } = useJobPoller({
    resumeJobId: job.job_id,
    jobType: job.job_type,
    skipRegistration: true,
    invalidateKeys: job.household_id ? [["households", job.household_id]] : undefined,
  });

  const steps = status?.steps ?? [];
  const currentStep = steps[steps.length - 1] ?? "Initialising…";
  const elapsed = useElapsed(job.started_at, isPolling);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [steps.length]);

  // Announce terminal state once across the whole tab — see markJobNotified
  useEffect(() => {
    if (isDone && markJobNotified(job.job_id)) {
      toast.success("Audio analysis complete", {
        description: "Household data has been updated.",
      });
    } else if (isFailed && markJobNotified(job.job_id)) {
      toast.error("Audio analysis failed", {
        description: status?.error ?? undefined,
      });
    } else if (notFound) {
      markJobNotified(job.job_id);
    }
  }, [isDone, isFailed, notFound, status?.error, job.job_id]);

  const stages = [
    { label: "Upload", done: steps.length >= 1 },
    {
      label: "Transcribe",
      done: steps.some(
        (s) => s.includes("Transcription complete") || s.includes("words"),
      ),
    },
    {
      label: "Extract",
      done: steps.some(
        (s) =>
          s.includes("Extraction complete") ||
          s.includes("Done") ||
          isDone,
      ),
    },
  ];

  const tone = isFailed || notFound
    ? "border-destructive/25 bg-destructive/5"
    : isDone
      ? "border-primary/30 bg-primary/5"
      : "border-primary/25 bg-gradient-to-br from-primary/5 to-primary/[0.02]";

  return (
    <div className={`border rounded-xl shadow-sm overflow-hidden ${tone}`}>
      <div className="px-5 py-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative">
              <Mic className="w-5 h-5 text-primary" />
              {isPolling && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                  <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
                </span>
              )}
              {isDone && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </span>
              )}
              {(isFailed || notFound) && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                  <XCircle className="w-3 h-3 text-white" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">
                  {isPolling && "Analysing audio recording"}
                  {isDone && "Analysis complete"}
                  {isFailed && "Analysis failed"}
                  {notFound && "Job no longer tracked"}
                </p>
                {isPolling && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary uppercase tracking-wider">
                    Live
                  </span>
                )}
              </div>
              {job.filename && (
                <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                  {job.filename}
                </p>
              )}
              {isPolling && (
                <p className="text-[12px] text-foreground/70 mt-1 leading-snug">
                  <span className="font-semibold text-primary">
                    Step {steps.length || 1}:
                  </span>{" "}
                  {currentStep}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 shrink-0">
            {isPolling && (
              <div className="text-right">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Elapsed
                </p>
                <p className="text-sm font-mono tabular-nums font-bold text-foreground leading-none">
                  {elapsed}
                </p>
              </div>
            )}
            {(isDone || isFailed || notFound) && (
              <button
                type="button"
                onClick={() => removeJob(job.job_id)}
                aria-label="Dismiss"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Pipeline stages */}
        {(isPolling || isDone) && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {stages.map((stage) => (
              <div
                key={stage.label}
                className={`rounded-lg border px-3 py-2 text-center transition-all ${
                  stage.done
                    ? "border-primary/30 bg-primary/10"
                    : "border-border bg-background/60"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {stage.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                  )}
                </div>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    stage.done ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Error / not-found messages */}
        {isFailed && status?.error && (
          <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive/90">
            {status.error}
          </div>
        )}
        {notFound && (
          <div className="mt-4 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive/80">
            This job is no longer tracked by the server (it may have completed
            during a restart). Refresh the page to see the latest household
            data.
          </div>
        )}

        {/* Done summary */}
        {isDone && status?.result && (() => {
          const r = status.result as {
            transcript_text?: string;
            updates_applied?: number;
            conflicts_created?: number;
          };
          return (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background border border-border rounded-lg px-3 py-2.5 text-center">
                  <p className="text-xl font-bold font-mono tabular-nums text-primary">
                    {r.updates_applied ?? 0}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                    Updates applied
                  </p>
                </div>
                <div className="bg-background border border-border rounded-lg px-3 py-2.5 text-center">
                  <p className="text-xl font-bold font-mono tabular-nums text-[hsl(38,80%,42%)]">
                    {r.conflicts_created ?? 0}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                    Conflicts flagged
                  </p>
                </div>
              </div>
              {r.transcript_text && (
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="font-semibold">View transcript</span>
                    </div>
                  </summary>
                  <p className="mt-2 text-[12px] text-foreground/70 leading-relaxed bg-background border border-border rounded-lg p-3 max-h-40 overflow-y-auto">
                    {r.transcript_text}
                  </p>
                </details>
              )}
            </div>
          );
        })()}

        {/* Live step log (only while running) */}
        {isPolling && steps.length > 0 && (
          <details className="mt-4 group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium">
                <span className="group-open:hidden">
                  Show processing log ({steps.length})
                </span>
                <span className="hidden group-open:inline">
                  Hide processing log
                </span>
              </div>
            </summary>
            <div
              ref={logRef}
              className="mt-2 bg-background/80 border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-1.5"
            >
              {steps.map((step, i) => {
                const isLast = i === steps.length - 1;
                const isRunning = isLast && isPolling;
                return (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    {isRunning ? (
                      <Loader2 className="w-3 h-3 text-primary animate-spin shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        isLast
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>

      {/* Animated progress strip at the bottom while running */}
      {isPolling && (
        <div className="h-1 bg-primary/10 overflow-hidden">
          <div className="h-full w-1/2 bg-primary rounded-r-full animate-pulse" />
        </div>
      )}
    </div>
  );
}

function useElapsed(startedAt: string, active: boolean): string {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const startMs = new Date(startedAt).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
