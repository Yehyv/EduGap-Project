import api from "@/shared/services/axios";
import type { InstitutesResponse } from "../types/dashboardTypes";

export async function getInstitutes(): Promise<InstitutesResponse> {
  const res = await api.get<InstitutesResponse>(`/institutes`);
  return res.data;
}
