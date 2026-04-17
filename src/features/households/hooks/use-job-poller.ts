import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { jobApi } from "@/lib/api";
import type { JobStatus } from "@/types";
import { useActiveJobs, type ActiveJobType } from "./use-active-jobs";

const POLL_INTERVAL_MS = 1500;

interface UseJobPollerOptions {
  /** Extra query keys to invalidate on successful completion (in addition to ["households"]). */
  invalidateKeys?: unknown[][];
  /** If provided, the poller auto-starts for this job on mount (used to resume after refresh). */
  resumeJobId?: string;
  /** Metadata stored in the active-jobs list so the header pill can display context. */
  jobType?: ActiveJobType;
  /** When true, the hook will not touch the active-jobs localStorage list. */
  skipRegistration?: boolean;
}

export function useJobPoller(options: UseJobPollerOptions = {}) {
  const { resumeJobId, jobType, skipRegistration, invalidateKeys } = options;

  const [jobId, setJobId] = useState<string | null>(resumeJobId ?? null);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [notFound, setNotFound] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didInvalidate = useRef(false);
  const qc = useQueryClient();
  const { addJob, removeJob } = useActiveJobs();

  const start = useCallback(
    (id: string, meta?: { household_id?: string; filename?: string }) => {
      didInvalidate.current = false;
      setNotFound(false);
      setJobId(id);
      setJob(null);
      if (!skipRegistration && jobType) {
        addJob({
          job_id: id,
          job_type: jobType,
          started_at: new Date().toISOString(),
          household_id: meta?.household_id,
          filename: meta?.filename,
        });
      }
    },
    [addJob, jobType, skipRegistration],
  );

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    didInvalidate.current = false;
    if (jobId && !skipRegistration) removeJob(jobId);
    setJobId(null);
    setJob(null);
    setNotFound(false);
  }, [jobId, removeJob, skipRegistration]);

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const data: JobStatus = await jobApi.getStatus(jobId);
        setJob(data);
        if (data.status === "done" || data.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // NOTE: we intentionally do NOT remove the job from the persistent
          // list here — callers (header pill / upload dialogs) render the
          // terminal state before explicitly dismissing. They invoke
          // `reset()` when the user acknowledges.
          if (data.status === "done" && !didInvalidate.current) {
            didInvalidate.current = true;
            qc.invalidateQueries({ queryKey: ["households"] });
            invalidateKeys?.forEach((key) =>
              qc.invalidateQueries({ queryKey: key }),
            );
          }
        }
      } catch (err) {
        // Server restart wipes the in-memory job store → 404.
        // Treat that as a terminal state and clear the stale entry.
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (!skipRegistration) removeJob(jobId);
          setNotFound(true);
        }
        // other transient errors — keep polling
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const isPolling =
    !!jobId && !notFound && job?.status !== "done" && job?.status !== "failed";
  const isDone = job?.status === "done";
  const isFailed = job?.status === "failed";

  return { start, reset, job, jobId, isPolling, isDone, isFailed, notFound };
}
