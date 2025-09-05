import type { ApiResponse, ExpertsData } from "../types/sharedTypes";
import api from "./axios";

export async function getExpertsForSlider(): Promise<ExpertsData[]> {
  const res = await api.get<ApiResponse<ExpertsData[]>>("/educators/first-8");
  return res.data.data;
}
