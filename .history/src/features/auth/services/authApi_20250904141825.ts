import api from "@/shared/services/axios";

export function loginUser(data) {
  return api.post("/auth/login", data);
}
