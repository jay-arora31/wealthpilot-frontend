import axios from "axios";
import type {
  AccountCreate,
  AccountUpdate,
  BankDetailUpdate,
  HouseholdCreate,
  HouseholdUpdate,
  MemberCreate,
  MemberUpdate,
} from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
});

export const householdApi = {
  list: () => api.get("/households").then((r) => r.data),
  getById: (id: string) => api.get(`/households/${id}`).then((r) => r.data),
  create: (data: HouseholdCreate) =>
    api.post("/households", data).then((r) => r.data),
  update: (id: string, data: HouseholdUpdate) =>
    api.put(`/households/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/households/${id}`),
  uploadExcel: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/households/upload-excel", fd).then((r) => r.data);
  },
  uploadAudio: (id: string, file: File, force: boolean = false) => {
    const fd = new FormData();
    fd.append("file", file);
    return api
      .post(`/households/${id}/upload-audio`, fd, {
        params: force ? { force: true } : undefined,
      })
      .then((r) => r.data);
  },
};

export const memberApi = {
  list: (householdId: string) =>
    api.get(`/households/${householdId}/members`).then((r) => r.data),
  create: (householdId: string, data: MemberCreate) =>
    api.post(`/households/${householdId}/members`, data).then((r) => r.data),
  update: (memberId: string, data: MemberUpdate) =>
    api.put(`/members/${memberId}`, data).then((r) => r.data),
  delete: (memberId: string) => api.delete(`/members/${memberId}`),
};

export const accountApi = {
  list: (householdId: string) =>
    api.get(`/households/${householdId}/accounts`).then((r) => r.data),
  create: (householdId: string, data: AccountCreate) =>
    api.post(`/households/${householdId}/accounts`, data).then((r) => r.data),
  update: (accountId: string, data: AccountUpdate) =>
    api.put(`/accounts/${accountId}`, data).then((r) => r.data),
  delete: (accountId: string) => api.delete(`/accounts/${accountId}`),
};

export const bankDetailApi = {
  update: (bankId: string, data: BankDetailUpdate) =>
    api.put(`/bank-details/${bankId}`, data).then((r) => r.data),
  delete: (bankId: string) => api.delete(`/bank-details/${bankId}`),
};

export const conflictApi = {
  list: (householdId: string) =>
    api.get(`/households/${householdId}/conflicts`).then((r) => r.data),
  resolve: (conflictId: string, action: "accept" | "reject") =>
    api
      .post(`/conflicts/${conflictId}/resolve`, { action })
      .then((r) => r.data),
};

export const insightApi = {
  get: () => api.get("/households/insights").then((r) => r.data),
};

export const jobApi = {
  getStatus: (jobId: string) => api.get(`/jobs/${jobId}`).then((r) => r.data),
};

export const adminApi = {
  resetAllData: () =>
    api.delete<{ households_deleted: number }>("/admin/reset").then((r) => r.data),
};
