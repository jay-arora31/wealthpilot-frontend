import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/lib/api";

export function useAccounts(householdId: string) {
  return useQuery({
    queryKey: ["accounts", householdId],
    queryFn: () => accountApi.list(householdId),
    enabled: !!householdId,
  });
}
