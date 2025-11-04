import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ContentEducatorType,
  lessonActionsHistory,
  MyNotesInLessonTypeResponse,
} from "@/shared/types/sharedTypes";

export async function getContentEducator(
  courseId: string
): Promise<ContentEducatorType> {
  const res = await api.get<ApiResponse<ContentEducatorType>>(
    `/contents/${courseId}/educator`
  );
  return res.data.data;
}
export async function getMyNotesInLesson(
  page: number,
  lessonId: string
): Promise<MyNotesInLessonTypeResponse> {
  const res = await api.get<ApiResponse<MyNotesInLessonTypeResponse>>(
    `/lesson-notes/lessons/${lessonId}/me`,
    {
      params: {
        page,
      },
    }
  );
  return res.data.data;
}
export async function rateContent(
  courseId: string,
  rating: number
): Promise<void> {
  const res = await api.post<ApiResponse<void>>(
    `/enrollments/${courseId}/rate`,
    {
      rating: +rating,
    }
  );

  return res.data.data;
}
export async function likeLesson(lessonId: string): Promise<void> {
  const res = await api.post<ApiResponse<void>>(
    `/lesson-reactions/lessons/${lessonId}/like`
  );

  return res.data.data;
}
export async function dislikeLesson(lessonId: string): Promise<void> {
  const res = await api.post<ApiResponse<void>>(
    `/lesson-reactions/lessons/${lessonId}/dislike`
  );

  return res.data.data;
}
export async function saveLesson(lessonId: string): Promise<void> {
  const res = await api.post<ApiResponse<void>>(`/saved-lessons`, {
    lessonId,
  });

  return res.data.data;
}
export async function addLessonNote(
  lessonId: string,
  data: { noteName: string; notes: string }
): Promise<void> {
  const res = await api.post<ApiResponse<void>>(
    `/lesson-notes/lessons/${lessonId}`,
    {
      noteName: data.noteName,
      notes: data.notes,
    }
  );

  return res.data.data;
}

export async function getLessonActionsHistory(
  lessonId: string
): Promise<lessonActionsHistory> {
  const res = await api.get<ApiResponse<lessonActionsHistory>>(
    `/lessons/${lessonId}/actions`
  );
  return res.data.data;
}
