import { useCallback, useEffect, useState } from "react";

/**
 * Persists the set of in-flight background jobs to localStorage so the UI
 * can re-attach to them after a full-page refresh.
 *
 * The backend keeps job status in memory keyed by job_id; as long as the
 * server process is alive, we can resume polling by the stored id. If the
 * server was restarted the status endpoint returns 404 and the entry is
 * cleared by the poller.
 */

const STORAGE_KEY = "wealthpilot.active_jobs";
const CHANGE_EVENT = "wealthpilot:active-jobs-changed";

export type ActiveJobType = "excel" | "audio";

export interface ActiveJob {
  job_id: string;
  job_type: ActiveJobType;
  started_at: string;
  household_id?: string;
  filename?: string;
}

function read(): ActiveJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (j): j is ActiveJob =>
        j && typeof j.job_id === "string" && typeof j.job_type === "string",
    );
  } catch {
    return [];
  }
}

function write(jobs: ActiveJob[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Module-level set of job ids for which a terminal-state toast has already
 * been surfaced in this tab. Shared across components (AudioJobCard,
 * AudioJobFloatingToast, JobStatusPill) so we don't double-notify when the
 * user navigates between the inline card and the floating toast mid-job.
 */
const notifiedJobIds = new Set<string>();

export function markJobNotified(jobId: string): boolean {
  if (notifiedJobIds.has(jobId)) return false;
  notifiedJobIds.add(jobId);
  return true;
}

export function useActiveJobs() {
  const [jobs, setJobs] = useState<ActiveJob[]>(() => read());

  useEffect(() => {
    const refresh = () => setJobs(read());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const addJob = useCallback((job: ActiveJob) => {
    const current = read();
    if (current.some((j) => j.job_id === job.job_id)) return;
    write([...current, job]);
  }, []);

  const removeJob = useCallback((jobId: string) => {
    const current = read();
    const next = current.filter((j) => j.job_id !== jobId);
    if (next.length !== current.length) write(next);
  }, []);

  return { jobs, addJob, removeJob };
}
