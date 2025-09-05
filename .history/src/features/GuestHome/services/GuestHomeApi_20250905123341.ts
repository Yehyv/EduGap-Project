import api from "@/shared/services/axios";
import type { ApiResponse, CourseTypes } from "@/shared/types/sharedTypes";

export async function getGuestPopularCourses(): Promise<CourseTypes[]> {
  const res = await api.get<ApiResponse<CourseTypes[]>>(
    "/courses/visitors/first-8"
  );
  return res.data.data;
}
