import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conflictApi } from "@/lib/api";

export function useConflicts(householdId: string) {
  return useQuery({
    queryKey: ["conflicts", householdId],
    queryFn: () => conflictApi.list(householdId),
    enabled: !!householdId,
    staleTime: 0,
  });
}

export function useResolveConflict(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      conflictId,
      action,
    }: {
      conflictId: string;
      action: "accept" | "reject";
    }) => conflictApi.resolve(conflictId, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conflicts", householdId] });
      qc.invalidateQueries({ queryKey: ["households", householdId] });
    },
  });
}
