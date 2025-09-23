import api from "@/shared/services/axios";
import type {
  ApiResponse,
  CoursesResponse,
  CourseType,
  ExpertsResponse,
  ProgramsResponse,
  ProgramsType,
} from "@/shared/types/sharedTypes";

export async function getGuestPopularCourses(): Promise<CourseType[]> {
  const res = await api.get<ApiResponse<CourseType[]>>("/contents/first-8");
  return res.data.data;
}
export async function getAllGuestPopularCourses(
  page: string,
  limit: number
): Promise<CoursesResponse> {
  const res = await api.get<ApiResponse<CoursesResponse>>("/contents", {
    params: { page, limit },
  });
  return res.data.data;
}

export async function getEducationProgramsForSlider(): Promise<ProgramsType[]> {
  const res = await api.get<ApiResponse<ProgramsType[]>>("/programs/first-8");
  return res.data.data;
}

export async function getAllEducationsList(
  page: string,
  limit: string
): Promise<ProgramsResponse> {
  const res = await api.get<ApiResponse<ProgramsResponse>>("/programs", {
    params: { page, limit },
  });
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
