import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ChangePasswordTypes,
  ProfileDataTypes,
} from "@/shared/types/sharedTypes";

export async function changeUserName(newName: string): Promise<void> {
  const res = await api.post<ApiResponse<void>>(`/users/profile/change-name`, {
    newName,
  });

  return res.data.data;
}
export async function changePhoneNumber(newPhone: string): Promise<void> {
  const res = await api.post<ApiResponse<void>>(
    `/users/profile/change-phone/request`,
    {
      newPhone,
    }
  );

  return res.data.data;
}
export async function changePhoneNumberVerifyOtp(
  code: string,
  challengeId: string,
  newPhone: string
): Promise<void> {
  const res = await api.post<ApiResponse<void>>(
    `/users/profile/change-phone/verify`,
    {
      code,
      challengeId,
      newPhone,
    }
  );

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
export async function updateUserImage(formData: FormData) {
  const res = await api.patch(`/users/update-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}
export async function getProfileData(): Promise<ProfileDataTypes> {
  const res = await api.get<ApiResponse<ProfileDataTypes>>(`/users/profile`);

  return res.data.data;
}
