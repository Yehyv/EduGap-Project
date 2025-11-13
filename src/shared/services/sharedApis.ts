import type {
  ApiResponse,
  CoursesResponse,
  ExpertsData,
} from "../types/sharedTypes";
import api from "./axios";

export async function getExpertsForSlider(): Promise<ExpertsData[]> {
  const res = await api.get<ApiResponse<ExpertsData[]>>("/educators/first-8");
  return res.data.data;
}
export async function search(
  q: string,
  page: number = 1,
  limit: number = 8
): Promise<CoursesResponse> {
  const res = await api.get<ApiResponse<CoursesResponse>>(
    `/search/contents?q=${q}&page=${page}&limit=${limit}`
  );
  return res.data.data;
}
