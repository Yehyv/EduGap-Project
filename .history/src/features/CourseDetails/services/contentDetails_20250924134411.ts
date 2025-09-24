import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ContentDetailsType,
} from "@/shared/types/sharedTypes";

export async function getContentDetails(): Promise<ContentDetailsType> {
  const res = await api.get<ApiResponse<ContentDetailsType>>(
    "/contents/1/content-details/unenrolled"
  );
  return res.data.data;
}
export async function getContentDetailsForEnrolledUsers(): Promise<ContentDetailsType> {
  const res = await api.get<ApiResponse<ContentDetailsType>>(
    "/contents/1/content-details/enrolled"
  );
  return res.data.data;
}
export async function enrollContent(contentId: string) {
  const res = await api.post(`/enrollments/${contentId}/enroll`);
  return res.data.data;
}
