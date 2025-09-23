import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ContinueCourseType,
} from "@/shared/types/sharedTypes";

export async function getContentDetails(): Promise<ContinueCourseType[]> {
  const res = await api.get<ApiResponse<ContinueCourseType[]>>(
    "/contents/1/content-details/unenrolled"
  );
  return res.data.data;
}
