import type { VerifyOtpValues } from "@/features/auth/auth.types";
import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ChangePasswordTypes,
} from "@/shared/types/sharedTypes";

export async function changeUserName(newName: string): Promise<void> {
  const res = await api.post<ApiResponse<void>>(`/users/change-name`, {
    newName,
  });

  return res.data.data;
}
export async function changePhoneNumber(newPhone: string): Promise<void> {
  const res = await api.post<ApiResponse<void>>(`/users/change-phone/request`, {
    newPhone,
  });

  return res.data.data;
}
export async function changePhoneNumberVerifyOtp(
  code,
  challengeId,
  newPhone
): Promise<void> {
  const res = await api.post<ApiResponse<void>>(`/users/change-phone/verify`, {
    code,
    challengeId,
    newPhone,
  });

  return res.data.data;
}

export async function changePasswordFromProfile(
  values: ChangePasswordTypes
): Promise<void> {
  const res = await api.post<ApiResponse<void>>(
    `/auth/change-password`,
    values
  );

  return res.data.data;
}
