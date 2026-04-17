import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Loader2,
  Mic,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { markJobNotified, useActiveJobs, type ActiveJob } from "../hooks/use-active-jobs";
import { useJobPoller } from "../hooks/use-job-poller";

/**
 * A header-level indicator for in-flight background jobs (Excel import,
 * audio processing). Reads from the persistent active-jobs list so it
 * survives a full-page refresh and can re-attach to the ongoing job.
 */
export function JobStatusPill() {
  const { jobs: allJobs, removeJob } = useActiveJobs();
  // The navbar is reserved for global, cross-household operations. Audio
  // jobs are scoped to a single household and are surfaced inline on that
  // household's detail page (with a floating corner toast as a fallback
  // when the user navigates away).
  const jobs = allJobs.filter((j) => j.job_type === "excel");
  const [openId, setOpenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpenId(null);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [openId]);

  if (jobs.length === 0) return null;

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5">
      {jobs.map((job) => (
        <JobPill
          key={job.job_id}
          job={job}
          open={openId === job.job_id}
          onToggle={() =>
            setOpenId((cur) => (cur === job.job_id ? null : job.job_id))
          }
          onDismiss={() => {
            setOpenId(null);
            removeJob(job.job_id);
          }}
        />
      ))}
    </div>
  );
}

interface JobPillProps {
  job: ActiveJob;
  open: boolean;
  onToggle: () => void;
  onDismiss: () => void;
}

function JobPill({ job, open, onToggle, onDismiss }: JobPillProps) {
  const {
    job: status,
    isPolling,
    isDone,
    isFailed,
    notFound,
  } = useJobPoller({
    resumeJobId: job.job_id,
    jobType: job.job_type,
    // Pill is only mounted from the persistent active-jobs list, so don't
    // let the poller re-register/remove — the parent owns that lifecycle.
    skipRegistration: true,
    invalidateKeys:
      job.job_type === "audio" && job.household_id
        ? [["households", job.household_id]]
        : undefined,
  });

  // Fire a toast once per tab when the job reaches a terminal state —
  // covers the case where the originating modal was closed or the page
  // was refreshed. markJobNotified dedupes across component instances.
  useEffect(() => {
    const label = job.job_type === "excel" ? "Excel import" : "Audio analysis";
    if (isDone && markJobNotified(job.job_id)) {
      toast.success(`${label} complete`);
    } else if (isFailed && markJobNotified(job.job_id)) {
      toast.error(`${label} failed`, {
        description: status?.error ?? undefined,
      });
    } else if (notFound) {
      markJobNotified(job.job_id);
    }
  }, [isDone, isFailed, notFound, job.job_type, job.job_id, status?.error]);

  const label = job.job_type === "excel" ? "Excel import" : "Audio analysis";
  const Icon = job.job_type === "excel" ? FileSpreadsheet : Mic;
  const steps = status?.steps ?? [];
  const currentStep = steps[steps.length - 1] ?? "Initialising…";

  const pillClass = isFailed || notFound
    ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15"
    : isDone
      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
      : "bg-primary/8 text-primary border-primary/20 hover:bg-primary/12";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border text-xs font-semibold transition-colors ${pillClass}`}
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/60">
          {isPolling && <Loader2 className="w-3 h-3 animate-spin" />}
          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
          {(isFailed || notFound) && <XCircle className="w-3.5 h-3.5" />}
        </span>
        <span className="hidden sm:inline">{label}</span>
        <Icon className="w-3.5 h-3.5 opacity-70 sm:hidden" />
        <ChevronDown
          className={`w-3 h-3 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <JobPopover
          job={job}
          status={status}
          currentStep={currentStep}
          isPolling={isPolling}
          isDone={isDone}
          isFailed={isFailed}
          notFound={notFound}
          onDismiss={onDismiss}
        />
      )}
    </div>
  );
}

interface JobPopoverProps {
  job: ActiveJob;
  status: ReturnType<typeof useJobPoller>["job"];
  currentStep: string;
  isPolling: boolean;
  isDone: boolean;
  isFailed: boolean;
  notFound: boolean;
  onDismiss: () => void;
}

function JobPopover({
  job,
  status,
  currentStep,
  isPolling,
  isDone,
  isFailed,
  notFound,
  onDismiss,
}: JobPopoverProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const steps = status?.steps ?? [];

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [steps.length]);

  const elapsed = useElapsed(job.started_at, isPolling);
  const label = job.job_type === "excel" ? "Excel import" : "Audio analysis";

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[360px] bg-white border border-border rounded-xl shadow-xl p-4 space-y-3 animate-in fade-in-0 zoom-in-95">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{label}</p>
          {job.filename && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {job.filename}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <StatusBadge
            isPolling={isPolling}
            isDone={isDone}
            isFailed={isFailed}
            notFound={notFound}
          />
          {isPolling && (
            <p className="text-[10px] font-mono tabular-nums text-muted-foreground mt-1">
              {elapsed}
            </p>
          )}
        </div>
      </div>

      {isPolling && (
        <div className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
            Step {steps.length || 1}
          </p>
          <p className="text-xs text-foreground font-medium mt-0.5 leading-snug">
            {currentStep}
          </p>
        </div>
      )}

      {notFound && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive/80">
          This job is no longer tracked by the server (it may have finished
          while the server was restarting). Please check your households list.
        </div>
      )}

      {isFailed && status?.error && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive/80">
          {status.error}
        </div>
      )}

      {steps.length > 0 && (
        <div
          ref={logRef}
          className="bg-muted/50 border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-1.5"
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
      )}

      {isPolling && (
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-primary rounded-full animate-pulse" />
        </div>
      )}

      {(isDone || isFailed || notFound) && (
        <button
          type="button"
          onClick={onDismiss}
          className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

function StatusBadge({
  isPolling,
  isDone,
  isFailed,
  notFound,
}: {
  isPolling: boolean;
  isDone: boolean;
  isFailed: boolean;
  notFound: boolean;
}) {
  if (isPolling) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
        <Loader2 className="w-3 h-3 animate-spin" />
        Running
      </span>
    );
  }
  if (isDone) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
        <CheckCircle2 className="w-3 h-3" />
        Done
      </span>
    );
  }
  if (isFailed || notFound) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-destructive uppercase tracking-wider">
        <XCircle className="w-3 h-3" />
        {notFound ? "Lost" : "Failed"}
      </span>
    );
  }
  return null;
}

function useElapsed(startedAt: string, active: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  // tick is referenced so the effect re-renders each second
  void tick;
  const startMs = new Date(startedAt).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
