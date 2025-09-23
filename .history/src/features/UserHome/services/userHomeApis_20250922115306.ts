import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ContinueCourseType,
  CourseType,
} from "@/shared/types/sharedTypes";

export async function getResumeWhereLeftForSlider(): Promise<CourseType[]> {
  const res = await api.get<ApiResponse<ContinueCourseType[]>>(
    "/lessons/first-8"
  );
  return res.data.data;
}
