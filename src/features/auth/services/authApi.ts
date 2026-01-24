import api from "@/shared/services/axios";
import type {
  LoginFormValues,
  VerifyOtpValues,
  ChangePasswordValues,
  ForgotPasswordFormValues,
  ChangePasswordForForgotPasswordValues,
} from "../auth.types";

export function loginUser(data: LoginFormValues) {
  return api.post("/auth/signin", data);
}
export function loginDashboardUser(data: LoginFormValues) {
  return api.post("/system-auth/signin", data);
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
export function restPasswordForForgetPassword(
  data: ChangePasswordForForgotPasswordValues,
  token: string,
) {
  return api.post("/auth/reset-password", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export function logoutUser() {
  return api.post("/auth/logout");
}

export function forgotPassword(data: ForgotPasswordFormValues) {
  return api.post("/auth/forgot-password", data);
}
