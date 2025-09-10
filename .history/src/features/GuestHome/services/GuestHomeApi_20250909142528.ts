import api from "@/shared/services/axios";
import type { ApiResponse, CourseType } from "@/shared/types/sharedTypes";

export async function getGuestPopularCourses(): Promise<CourseType[]> {
  const res = await api.get<ApiResponse<CourseType[]>>(
    "/courses/visitors/first-8"
  );
  return res.data.data;
}
export async function getAllGuestPopularCourses(
  page: string,
  limit: string
): Promise<CourseType[]> {
  const res = await api.get<ApiResponse<CourseType[]>>("/courses/visitors", {
    params: {
      page,
      limit,
    },
  });
  return res.data.data;
}
