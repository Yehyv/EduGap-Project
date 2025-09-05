import api from "@/shared/services/axios";

export function login(data) {
  return api.post("/auth/login", data);
}
