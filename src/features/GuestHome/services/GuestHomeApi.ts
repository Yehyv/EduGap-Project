import api from "@/shared/services/axios";
import type {
  ApiResponse,
  CoursesResponse,
  CourseType,
  ExpertsResponse,
  ProgramsResponse,
  ProgramsType,
} from "@/shared/types/sharedTypes";

export async function getPopularCoursesForSlider(
  programId?: number
): Promise<CourseType[]> {
  const res = await api.get<ApiResponse<CourseType[]>>(
    `/contents/trending/first-8?programId=${programId}`
  );
  return res.data.data;
}
export async function getLatestCoursesForSlider(
  programId?: number
): Promise<CourseType[]> {
  const res = await api.get<ApiResponse<CourseType[]>>(
    `/contents/latest/first-8?programId=${programId}`
  );
  return res.data.data;
}
export async function getSavedCoursesForSlider(): Promise<CourseType[]> {
  const res = await api.get<ApiResponse<CourseType[]>>(
    "/saved-contents/user/first-8"
  );
  return res.data.data;
}
export async function getAllPopularCourses(
  page: string,
  limit: number,
  programId?: number
): Promise<CoursesResponse> {
  const res = await api.get<ApiResponse<CoursesResponse>>(
    `/contents/trending/paginated?programId=${programId}`,
    {
      params: { page, limit },
    }
  );
  return res.data.data;
}
export async function getCoursePrerequisites(
  courseId?: string
): Promise<CoursesResponse> {
  const res = await api.get<ApiResponse<CoursesResponse>>(
    `/contents/${courseId}/prerequisites`
  );
  return res.data.data;
}
export async function getLatestCoursesList(
  page: string,
  limit: number,
  programId?: number
): Promise<CoursesResponse> {
  const res = await api.get<ApiResponse<CoursesResponse>>(
    `/contents/latest/paginated?programId=${programId}`,
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
  const res = await api.get<ApiResponse<CoursesResponse>>(
    "/saved-contents/user",
    {
      params: { page, limit },
    }
  );
  return res.data.data;
}

export async function getEducationProgramsForSlider(): Promise<ProgramsType[]> {
  const res = await api.get<ApiResponse<ProgramsType[]>>(
    "/packages-contents/first-8"
  );
  return res.data.data;
}

export async function getAllEducationsList(
  page: string,
  limit: number
): Promise<ProgramsResponse> {
  const res = await api.get<ApiResponse<ProgramsResponse>>(
    "/packages-contents/paginated",
    {
      params: { page, limit },
    }
  );
  return res.data.data;
}

export async function getAllExpertsList(
  page: string,
  limit: number
): Promise<ExpertsResponse> {
  const res = await api.get<ApiResponse<ExpertsResponse>>("/educators", {
    params: {
      page,
      limit,
    },
  });
  return res.data.data;
}
