import api from "@/shared/services/axios";
import type {
  InstitutesCoursesResponse,
  InstitutesResponse,
  UserResponse,
  UsersResponse,
} from "../types/dashboardTypes";

export async function getInstitutes(): Promise<InstitutesResponse> {
  const res = await api.get<InstitutesResponse>(
    `/institutes/super-admin/institutes-list`
  );
  return res.data;
}
export async function getInstitutesCoursesForDashboard(): Promise<InstitutesCoursesResponse> {
  const res = await api.get<InstitutesCoursesResponse>(
    `/courses/super-admin/courses-list`
  );
  return res.data;
}
export async function deleteInstitute(instituteId: number): Promise<void> {
  const res = await api.delete<void>(`/institutes/${instituteId}`);
  return res.data;
}

export async function getStudents(): Promise<UsersResponse> {
  const res = await api.get<UsersResponse>(`/users/super-admin/users-list`);
  return res.data;
}
export async function getStudentDetails(
  studentId: string
): Promise<UserResponse> {
  const res = await api.get<UserResponse>(
    `/users/${studentId}/super-admin/user`
  );
  return res.data;
}

export async function createStudent(data): Promise<void> {
  const res = await api.post<void>(`/users`, data);
  return res.data;
}
export async function editStudent(data): Promise<void> {
  const res = await api.patch<void>(`/users/${data.studentId}`, data);
  return res.data;
}
export async function deleteStudent(studentId: number): Promise<void> {
  const res = await api.delete<void>(`/users/${studentId}`);
  return res.data;
}

// DropDown List
export async function getInstitutesForDropdownList(): Promise<InstitutesCoursesResponse> {
  const res = await api.get<InstitutesCoursesResponse>(
    `/institutes/dropdown/list`
  );
  return res.data;
}
