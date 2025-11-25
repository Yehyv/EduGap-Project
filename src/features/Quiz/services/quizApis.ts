import api from "@/shared/services/axios";
import type { ApiResponse } from "@/shared/types/sharedTypes";
import type { QuizDetailsType, SumbitQuizType } from "../types/quizTypes";

export async function getQuizDetails(
  leesonId: string
): Promise<QuizDetailsType> {
  const res = await api.get<ApiResponse<QuizDetailsType>>(
    `/questions/lesson/${leesonId}`
  );
  return res.data.data;
}
export async function submitQuizAnswers(data: SumbitQuizType) {
  const res = await api.post(`/questions/submit`, data);
  return res.data.data;
}
