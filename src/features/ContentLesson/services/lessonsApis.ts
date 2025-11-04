import api from "@/shared/services/axios";
import type {
  ApiResponse,
  CommentsTypeResponse,
  ContentEducatorType,
  lessonActionsHistory,
  lessonMaterialsTypes,
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
  const res = await api.post<ApiResponse<void>>(
    `/saved-lessons/lessons/${lessonId}/toggle`
  );

  return res.data.data;
}
export async function addLessonNote(
  lessonId: string,
  data: { notes: string }
): Promise<void> {
  const res = await api.post<ApiResponse<void>>(
    `/lesson-notes/lessons/${lessonId}`,
    {
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

export async function updateNoteInLesson(
  lessonId: number,
  notes: string
): Promise<void> {
  const res = await api.patch<ApiResponse<void>>(`/lesson-notes/${lessonId}`, {
    notes,
  });

  return res.data.data;
}
export async function deleteNoteInLesson(lessonId: number): Promise<void> {
  const res = await api.delete<ApiResponse<void>>(`/lesson-notes/${lessonId}`);

  return res.data.data;
}

export async function getComments(
  lessonId: string,
  page: number
): Promise<CommentsTypeResponse> {
  const res = await api.get<ApiResponse<CommentsTypeResponse>>(
    `/lesson-comments/lessons/${lessonId}`,
    {
      params: {
        page,
      },
    }
  );
  return res.data.data;
}
export async function getLessonsMaterials(
  lessonId: string
): Promise<lessonMaterialsTypes[]> {
  const res = await api.get<ApiResponse<lessonMaterialsTypes[]>>(
    `/lesson-materials/content/${lessonId}`
  );
  return res.data.data;
}
export async function addComment(
  lessonId: string,
  comment: string
): Promise<void> {
  const res = await api.post<ApiResponse<void>>(
    `/lesson-comments/lessons/${lessonId}`,
    {
      comment,
    }
  );
  return res.data.data;
}
export async function deleteComment(lessonId: number): Promise<void> {
  const res = await api.delete<ApiResponse<void>>(
    `/lesson-comments/${lessonId}`
  );
  return res.data.data;
}
export async function editComment(
  lessonId: number,
  comment: string
): Promise<void> {
  const res = await api.patch<ApiResponse<void>>(
    `/lesson-comments/${lessonId}`,
    {
      comment,
    }
  );
  return res.data.data;
}
