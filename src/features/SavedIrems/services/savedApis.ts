import api from "@/shared/services/axios";
import type {
  ApiResponse,
  CoursesResponse,
  InstituteCoursesResponse,
  ProgramsResponse,
} from "@/shared/types/sharedTypes";

export async function getInstituteSubjects(
  page: string,
  limit: number
): Promise<InstituteCoursesResponse> {
  const res = await api.get<ApiResponse<InstituteCoursesResponse>>(
    "/saved-courses",
    {
      params: { page, limit },
    }
  );
  return res.data.data;
}

export async function getAllSavedContents(
  page: string,
  limit: number
): Promise<CoursesResponse> {
  const res = await api.get<ApiResponse<CoursesResponse>>("/saved-contents", {
    params: { page, limit },
  });
  return res.data.data;
}

export async function getSavedPrograms(
  page: string,
  limit: number
): Promise<ProgramsResponse> {
  const res = await api.get<ApiResponse<ProgramsResponse>>("/saved-packages", {
    params: { page, limit },
  });
  return res.data.data;
}

export async function saveInstituteSubject(contentId: number) {
  const res = await api.post(`/saved-courses/${contentId}/toggle`);
  return res.data.data;
}
export async function saveProgramLearningPath(contentId: number) {
  const res = await api.post(`/saved-packages/${contentId}/toggle`);
  return res.data.data;
}
