import api from "@/shared/services/axios";
import type { ApiResponse, CoursesResponse } from "@/shared/types/sharedTypes";

export async function getMyCurrentCourses(
  page: string,
  limit: number
): Promise<CoursesResponse> {
  const res = await api.get<ApiResponse<CoursesResponse>>(
    "/contents/in-progress",
    {
      params: { page, limit },
    }
  );
  return res.data.data;
}

export async function getMyCompletedCourses(
  page: string,
  limit: number
): Promise<CoursesResponse> {
  const res = await api.get<ApiResponse<CoursesResponse>>(
    "/contents/completed",
    {
      params: { page, limit },
    }
  );
  return res.data.data;
}
