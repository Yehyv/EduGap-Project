import api from "@/shared/services/axios";

export function login(data) {
  api.post("/auth/login", data);
}
