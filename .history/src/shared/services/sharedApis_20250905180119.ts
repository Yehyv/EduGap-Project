import type { ApiResponse, ExpertsData } from "../types/sharedTypes";
import api from "./axios";

export async function getExpertsForSlider(): Promise<ExpertsData[]> {
  const res = await api.get<ApiResponse<ExpertsData[]>>("/educators/first-8");
  return res.data.data;
}
export async function getAllExpertsList(
  page: string,
  limit: string
): Promise<ExpertsData[]> {
  const res = await api.get<ApiResponse<ExpertsData[]>>(
    "/educators?page=1&limit=8",
    {
      params: {
        page,
        limit,
      },
    }
  );
  return res.data.data;
}
