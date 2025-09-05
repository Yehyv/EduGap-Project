import api from "@/shared/services/axios";
import type { CourseTypes } from "@/shared/types/courses";

export async function getGuestPopularCourses(): Promise<CourseTypes[]> {
  const res = await api.get<CourseTypes[]>("/courses/visitors/first-8");
  return res.data;
}
