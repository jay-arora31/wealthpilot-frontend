import { useQuery } from "@tanstack/react-query";
import { insightApi } from "@/lib/api";

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: insightApi.get,
    staleTime: 30_000,
  });
}
