import api from "@/shared/services/axios";
import type {
  ApiResponse,
  CoursesResponse,
  CourseType,
  ExpertsResponse,
  ProgramsResponse,
  ProgramsType,
} from "@/shared/types/sharedTypes";

export async function getPopularCoursesForSlider(): Promise<CourseType[]> {
  const res = await api.get<ApiResponse<CourseType[]>>(
    "/contents/trending/first-8?programId=1"
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
  limit: number
): Promise<CoursesResponse> {
  // change program ID
  const res = await api.get<ApiResponse<CoursesResponse>>(
    "/contents/trending",
    {
      params: { page, limit, programId: 1 },
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
