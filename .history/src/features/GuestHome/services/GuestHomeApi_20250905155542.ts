import api from "@/shared/services/axios";
import type { ApiResponse, CourseTypes } from "@/shared/types/sharedTypes";

export async function getGuestPopularCourses(): Promise<CourseTypes[]> {
  const res = await api.get<ApiResponse<CourseTypes[]>>(
    "/courses/visitors/firsسt-8"
  );
  return res.data.data;
}
export async function getAllGuestPopularCourses(
  page: string,
  limit: string
): Promise<CourseTypes[]> {
  const res = await api.get<ApiResponse<CourseTypes[]>>("/courses/visitors", {
    params: {
      page,
      limit,
    },
  });
  return res.data.data;
}
