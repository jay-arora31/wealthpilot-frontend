import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memberApi } from "@/lib/api";
import type { MemberCreate } from "@/types";

export function useMembers(householdId: string) {
  return useQuery({
    queryKey: ["members", householdId],
    queryFn: () => memberApi.list(householdId),
    enabled: !!householdId,
  });
}

export function useAddMember(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MemberCreate) => memberApi.create(householdId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["households", householdId] }),
  });
}
