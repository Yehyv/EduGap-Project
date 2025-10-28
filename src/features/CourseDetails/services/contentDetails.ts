import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ContentAccessType,
  ContentDetailsType,
  ContentRatingsType,
  ContentTopicsType,
} from "@/shared/types/sharedTypes";

export async function getContentDetails(
  contentId: string
): Promise<ContentDetailsType> {
  const res = await api.get<ApiResponse<ContentDetailsType>>(
    `/contents/${contentId}/content-details/unenrolled`
  );
  return res.data.data;
}
export async function getContentDetailsForEnrolledUsers(
  courseId: string,
  programId: number
): Promise<ContentDetailsType> {
  const res = await api.get<ApiResponse<ContentDetailsType>>(
    `/contents/${courseId}/base?programId=${programId}`
  );
  return res.data.data;
}
export async function getContentAccessStatusForUser(
  courseId: string
): Promise<ContentAccessType> {
  const res = await api.get<ApiResponse<ContentAccessType>>(
    `/contents/${courseId}/access`
  );
  return res.data.data;
}
export async function getContentTopics(
  courseId: string
): Promise<ContentTopicsType[]> {
  const res = await api.get<ApiResponse<ContentTopicsType[]>>(
    `/contents/${courseId}/topics`
  );
  return res.data.data;
}
export async function getContentRatings(
  courseId: string
): Promise<ContentRatingsType> {
  const res = await api.get<ApiResponse<ContentRatingsType>>(
    `/contents/${courseId}/ratings`
  );
  return res.data.data;
}
export async function enrollContent(contentId: string) {
  const res = await api.post(`/enrollments/${contentId}/enroll`);
  return res.data.data;
}
