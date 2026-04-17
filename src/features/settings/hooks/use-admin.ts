import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

export function useResetAllData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.resetAllData(),
    onSuccess: () => {
      // Wipe every cached query — all data in the UI is now stale/empty.
      qc.clear();
    },
  });
}
