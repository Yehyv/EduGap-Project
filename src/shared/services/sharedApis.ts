import type {
  ApiResponse,
  CategoriesResponse,
  CoursesResponse,
  CourseType,
  ExpertsData,
  ProgramsType,
  savedContentDropdownResponse,
} from "../types/sharedTypes";
import api from "./axios";

export async function getExpertsForSlider(): Promise<ExpertsData[]> {
  const res = await api.get<ApiResponse<ExpertsData[]>>("/educators/first-8");
  return res.data.data;
}
export async function search(
  q: string,
  page: number = 1,
  limit: number = 8
): Promise<CoursesResponse> {
  const res = await api.get<ApiResponse<CoursesResponse>>(
    `/search/contents?q=${q}&page=${page}&limit=${limit}`
  );
  return res.data.data;
}

export async function navbarExpertsResults(
  isActive: number
): Promise<ExpertsData[]> {
  const res = await api.get<ApiResponse<ExpertsData[]>>(
    `/educators/all/nav?onlyActive=${isActive}`
  );
  return res.data.data;
}
export async function navbarSavedContentsResults(): Promise<savedContentDropdownResponse> {
  const res = await api.get<ApiResponse<savedContentDropdownResponse>>(
    `/saved-contents/all/nav`,
    {
      params: {
        limit: 6,
      },
    }
  );
  return res.data.data;
}
export async function navbarPackagesResults(): Promise<ProgramsType[]> {
  const res = await api.get<ApiResponse<ProgramsType[]>>(`/packages/all/nav`);
  return res.data.data;
}
export async function navbarContentsResults(
  programId: number
): Promise<CategoriesResponse> {
  const res = await api.get<ApiResponse<CategoriesResponse>>(
    `/contents/all/nav`,
    {
      params: {
        programId,
      },
    }
  );
  return res.data.data;
}
