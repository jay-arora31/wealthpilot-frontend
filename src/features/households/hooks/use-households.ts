import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi, bankDetailApi, householdApi, memberApi } from "@/lib/api";
import type {
  AccountUpdate,
  BankDetailUpdate,
  HouseholdCreate,
  HouseholdUpdate,
  MemberUpdate,
} from "@/types";

export function useHouseholds() {
  return useQuery({
    queryKey: ["households"],
    queryFn: householdApi.list,
    staleTime: 30_000,
  });
}

export function useHousehold(id: string) {
  return useQuery({
    queryKey: ["households", id],
    queryFn: () => householdApi.getById(id),
    enabled: !!id,
    // Always treat detail data as stale so navigating to the page fetches fresh data
    staleTime: 0,
  });
}

export function useCreateHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: HouseholdCreate) => householdApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["households"] }),
  });
}

export function useUploadExcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => householdApi.uploadExcel(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["households"] }),
  });
}

export function useUploadAudio(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => householdApi.uploadAudio(householdId, file),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["households", householdId] }),
  });
}

export function useUpdateHousehold(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: HouseholdUpdate) => householdApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["households"] });
      qc.invalidateQueries({ queryKey: ["households", id] });
    },
  });
}

export function useDeleteHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => householdApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["households"] }),
  });
}

export function useUpdateMember(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberUpdate }) =>
      memberApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["households", householdId] }),
  });
}

export function useDeleteMember(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => memberApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["households", householdId] }),
  });
}

export function useUpdateAccount(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AccountUpdate }) =>
      accountApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["households", householdId] }),
  });
}

export function useDeleteAccount(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["households", householdId] }),
  });
}

export function useUpdateBankDetail(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BankDetailUpdate }) =>
      bankDetailApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["households", householdId] }),
  });
}

export function useDeleteBankDetail(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bankDetailApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["households", householdId] }),
  });
}
