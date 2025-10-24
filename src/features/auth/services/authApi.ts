import api from "@/shared/services/axios";
import type {
  LoginFormValues,
  VerifyOtpValues,
  ChangePasswordValues,
} from "../auth.types";

export function loginUser(data: LoginFormValues) {
  return api.post("/auth/signin", data);
}
export function verifyOtp(data: VerifyOtpValues) {
  return api.post("/auth/verify-otp", data);
}
export function resetOtp(challengeId: string | null) {
  return api.post("/auth/resend-otp", {
    challengeId,
  });
}
export function changePassword(data: ChangePasswordValues, token: string) {
  return api.post("/auth/change-password", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export function logoutUser() {
  return api.post("/auth/logout");
}
