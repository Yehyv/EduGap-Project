import api from "@/shared/services/axios";
import type { LoginFormValues } from "../auth.types";

export function loginUser(data: LoginFormValues) {
  return api.post("/auth/login", data);
}
