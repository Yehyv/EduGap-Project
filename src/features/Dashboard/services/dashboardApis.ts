import api from "@/shared/services/axios";
import type { InstitutesResponse } from "../types/dashboardTypes";

export async function getInstitutes(): Promise<InstitutesResponse> {
  const res = await api.get<InstitutesResponse>(
    `/institutes/super-admin/institutes-list`
  );
  return res.data;
}
export async function deleteInstitute(instituteId: number): Promise<void> {
  const res = await api.delete<void>(`/institutes/${instituteId}`);
  return res.data;
}
