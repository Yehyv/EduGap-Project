import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ContinueCourseType,
  CourseType,
  InstituteCoursesResponse,
  InstituteCoursesType,
} from "@/shared/types/sharedTypes";

export async function getResumeWhereLeftForSlider(): Promise<
  ContinueCourseType[]
> {
  const res = await api.get<ApiResponse<ContinueCourseType[]>>(
    "/lessons/first-8"
  );
  return res.data.data;
}
export async function getInstituteCoursesForSlider(
  programId?: number
): Promise<InstituteCoursesType[]> {
  const res = await api.get<ApiResponse<InstituteCoursesType[]>>(
    `/courses/first-8?programId=${programId}`
  );
  return res.data.data;
}
export async function getInstituteCoursesForPage(
  page: number,
  limit: number,
  programId?: number
): Promise<InstituteCoursesResponse> {
  const res = await api.get<ApiResponse<InstituteCoursesResponse>>(
    `/contents/trending/paginated?programId=${programId}`,
    {
      params: { page, limit },
    }
  );
  return res.data.data;
}
export async function getRecommenedCourse(
  prgoramId?: number
): Promise<CourseType> {
  const res = await api.get<ApiResponse<CourseType>>(
    `/contents/latest/one?programId=${prgoramId}`
  );
  return res.data.data;
}
