import api from "@/shared/services/axios";
import type { ApiResponse, CourseType } from "@/shared/types/sharedTypes";

export async function getResumeWhereLeftForSlider(): Promise<CourseType[]> {
  const res = await api.get<ApiResponse<CourseType[]>>("/lessons/first-8");
  return res.data.data;
}
