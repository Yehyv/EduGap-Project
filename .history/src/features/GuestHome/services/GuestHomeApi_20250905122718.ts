import api from "@/shared/services/axios";
import type { CourseTypes } from "@/shared/types/courses";

export function getGuestPopularCourses() {
  return api
    .get<CourseTypes[]>("/courses/visitors/first-8")
    .then((res) => res.data);
}
