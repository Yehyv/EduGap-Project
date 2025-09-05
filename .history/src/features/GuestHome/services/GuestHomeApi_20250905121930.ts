import api from "@/shared/services/axios";

export function getGuestPopularCourses() {
  return api.get("/courses/visitors/first-8");
}
