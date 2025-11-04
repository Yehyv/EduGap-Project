import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ContentAccessType,
  ContentDetailsType,
  ContentLessonType,
  ContentRatingsType,
  ContentReviewsResponse,
  ContentTopicsType,
} from "@/shared/types/sharedTypes";

export async function getBaseContentDetails(
  courseId: string,
  programId?: number
): Promise<ContentDetailsType> {
  const res = await api.get<ApiResponse<ContentDetailsType>>(
    `/contents/${courseId}/base`,
    {
      params: {
        programId,
      },
    }
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
export async function getContentLesson(
  lessonId: string
): Promise<ContentLessonType> {
  const res = await api.get<ApiResponse<ContentLessonType>>(
    `/lessons/${lessonId}/content`
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
export async function saveContent(contentId: number) {
  const res = await api.post(`/saved-contents/${contentId}/save`);
  return res.data.data;
}
export async function getContentReviews(
  courseID: string
): Promise<ContentReviewsResponse> {
  const res = await api.get<ApiResponse<ContentReviewsResponse>>(
    `/contents/${courseID}/reviews`
  );
  return res.data.data;
}
