import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Mic,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { markJobNotified, useActiveJobs, type ActiveJob } from "../hooks/use-active-jobs";
import { useJobPoller } from "../hooks/use-job-poller";
import { useHouseholds } from "../hooks/use-households";

/**
 * Bottom-right floating indicator for audio jobs.
 *
 * Only rendered while the user is NOT on the owning household's detail page
 * — when they are, the inline AudioJobCard takes over as the primary
 * progress surface so we never show two indicators for the same job.
 */
export function AudioJobFloatingToast() {
  const { jobs } = useActiveJobs();
  const location = useLocation();

  const audioJobs = jobs.filter((j) => j.job_type === "audio");

  // Suppress toasts for jobs whose owning household's detail page is being
  // viewed — the inline card already shows the same info.
  const visible = audioJobs.filter((job) => {
    if (!job.household_id) return true;
    const path = location.pathname;
    return path !== `/households/${job.household_id}`;
  });

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
      {visible.map((job) => (
        <FloatingItem key={job.job_id} job={job} />
      ))}
    </div>
  );
}

function FloatingItem({ job }: { job: ActiveJob }) {
  const navigate = useNavigate();
  const { removeJob } = useActiveJobs();
  const { data: households } = useHouseholds();
  const householdName =
    households?.find(
      (h: { id: string; name: string }) => h.id === job.household_id,
    )?.name ?? "Household";

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
    invalidateKeys: job.household_id
      ? [["households", job.household_id]]
      : undefined,
  });

  const steps = status?.steps ?? [];
  const currentStep = steps[steps.length - 1] ?? "Initialising…";

  // Surface terminal states once per tab (markJobNotified prevents
  // duplicate toasts when the user navigates between inline card and
  // floating toast mid-job).
  useEffect(() => {
    if (isDone && markJobNotified(job.job_id)) {
      toast.success(`Audio analysis complete for ${householdName}`);
    } else if (isFailed && markJobNotified(job.job_id)) {
      toast.error(`Audio analysis failed for ${householdName}`, {
        description: status?.error ?? undefined,
      });
    } else if (notFound) {
      markJobNotified(job.job_id);
    }
  }, [isDone, isFailed, notFound, householdName, status?.error, job.job_id]);

  const tone =
    isFailed || notFound
      ? "border-destructive/30 bg-white"
      : isDone
        ? "border-primary/30 bg-white"
        : "border-border bg-white";

  return (
    <div
      className={`pointer-events-auto border rounded-xl shadow-lg ${tone} animate-in slide-in-from-bottom-4 fade-in-0`}
    >
      <div className="p-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 relative">
          <Mic className="w-4.5 h-4.5 text-primary" />
          {isPolling && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
              <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
            </span>
          )}
          {isDone && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            </span>
          )}
          {(isFailed || notFound) && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full flex items-center justify-center">
              <XCircle className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[13px] font-bold text-foreground truncate">
              {isPolling && "Processing audio"}
              {isDone && "Audio complete"}
              {isFailed && "Audio failed"}
              {notFound && "Job lost"}
            </p>
            <span className="text-[11px] text-muted-foreground">·</span>
            <p className="text-[12px] text-muted-foreground font-medium truncate">
              {householdName}
            </p>
          </div>
          {isPolling && (
            <p className="text-[11px] text-foreground/70 mt-0.5 leading-snug line-clamp-2">
              <span className="font-semibold text-primary">
                Step {steps.length || 1}:
              </span>{" "}
              {currentStep}
            </p>
          )}
          {isFailed && status?.error && (
            <p className="text-[11px] text-destructive/80 mt-0.5 leading-snug line-clamp-2">
              {status.error}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-2">
            {job.household_id && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/households/${job.household_id}`)
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                Open household
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
            {(isDone || isFailed || notFound) && (
              <>
                {job.household_id && (
                  <span className="text-[11px] text-muted-foreground/60">
                    ·
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeJob(job.job_id)}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {isPolling && (
        <div className="h-0.5 bg-primary/10 overflow-hidden rounded-b-xl">
          <div className="h-full w-1/2 bg-primary animate-pulse" />
        </div>
      )}
    </div>
  );
}
