import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { jobApi } from "@/lib/api";
import type { JobStatus } from "@/types";

const POLL_INTERVAL_MS = 1500;

interface UseJobPollerOptions {
  // Extra query keys to invalidate on completion (in addition to ["households"])
  invalidateKeys?: unknown[][];
}

export function useJobPoller(options: UseJobPollerOptions = {}) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didInvalidate = useRef(false);
  const qc = useQueryClient();

  const start = useCallback((id: string) => {
    didInvalidate.current = false;
    setJobId(id);
    setJob(null);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    didInvalidate.current = false;
    setJobId(null);
    setJob(null);
  }, []);

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const data: JobStatus = await jobApi.getStatus(jobId);
        setJob(data);
        if (data.status === "done" || data.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (data.status === "done" && !didInvalidate.current) {
            didInvalidate.current = true;
            // Always refresh the household list
            qc.invalidateQueries({ queryKey: ["households"] });
            // Also invalidate any caller-specified keys (e.g. a specific household detail)
            options.invalidateKeys?.forEach((key) =>
              qc.invalidateQueries({ queryKey: key })
            );
          }
        }
      } catch {
        // ignore transient errors
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId, qc]); // eslint-disable-line react-hooks/exhaustive-deps

  const isPolling = !!jobId && job?.status !== "done" && job?.status !== "failed";
  const isDone = job?.status === "done";
  const isFailed = job?.status === "failed";

  return { start, reset, job, isPolling, isDone, isFailed };
}
