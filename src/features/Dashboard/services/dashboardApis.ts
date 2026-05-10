import { dashboardApi } from "./../../../shared/services/dashboardApi";
import type {
  CategoriesResponse,
  CitiesResponse,
  ContentDetailsResponse,
  ContentsResponse,
  CountriesResponse,
  CourseDetailsResponseForDashboard,
  CoursesForDashboardResponse,
  ExpertDetailsResponse,
  ExppertsForDashboardResponse,
  instituteResponse,
  InstitutesCoursesResponse,
  InstitutesResponse,
  InstituteStudentsResponse,
  LanguagesResponse,
  LearningPathsForDashboard,
  LearningPathsForDashboardResponse,
  LessonDetailsResponse,
  ProgramDetailsResponseForAdmin,
  ProgramsInInstituteResponse,
  ProgramsResponseForAdmin,
  RoleCategoriesResponse,
  RolesDetailsResponse,
  RolesListResponse,
  SystemUserResponse,
  SystemUsers,
  SystemUsersResponse,
  TopicResponse,
  TopicsResponse,
  UserResponse,
  UsersResponse,
} from "../types/dashboardTypes";
import type { ExpertsResponse } from "@/shared/types/sharedTypes";
import type { QuizQuestion } from "@/features/Quiz/types/quizTypes";
import { formatLinesToComma } from "@/shared/utils/globals";

export async function getInstitutes(): Promise<InstitutesResponse> {
  const res = await dashboardApi.get<InstitutesResponse>(
    `/institutes/super-admin/institutes-list`,
  );
  return res.data;
}

export async function getInstitutesCoursesForDashboard(): Promise<InstitutesCoursesResponse> {
  const res = await dashboardApi.get<InstitutesCoursesResponse>(
    `/courses/super-admin/courses-list`,
  );
  return res.data;
}
export async function getCountriesDropdown(): Promise<CountriesResponse> {
  const res = await dashboardApi.get<CountriesResponse>(
    `/countries/super-admin/dropdown/list`,
  );
  return res.data;
}
export async function createCountry(data): Promise<void> {
  const res = await dashboardApi.post<void>(`/countries`, data);
  return res.data;
}
export async function editCountry(data): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/countries/${data.countryId}`,
    data,
  );
  return res.data;
}
export async function editCity(data): Promise<void> {
  const res = await dashboardApi.patch<void>(`/cities/${data.cityId}`, data);
  return res.data;
}
export async function editRegion(data): Promise<void> {
  const res = await dashboardApi.patch<void>(`/regions/${data.regionId}`, data);
  return res.data;
}
export async function createCity(data): Promise<void> {
  const res = await dashboardApi.post<void>(`/cities`, data);
  return res.data;
}
export async function createRegion(data): Promise<void> {
  const res = await dashboardApi.post<void>(`/regions`, data);
  return res.data;
}
export async function getAllCountries(): Promise<CountriesResponse> {
  const res = await dashboardApi.get<CountriesResponse>(`/countries`);
  return res.data;
}
export async function getAllCities(): Promise<CountriesResponse> {
  const res = await dashboardApi.get<CountriesResponse>(`/cities`);
  return res.data;
}
export async function getAllRegions(): Promise<CountriesResponse> {
  const res = await dashboardApi.get<CountriesResponse>(`/regions`);
  return res.data;
}
export async function deleteCountry(countryId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(`/countries/${countryId}`);
  return res.data;
}
export async function findCountry(countryId: number | string): Promise<void> {
  const res = await dashboardApi.get<void>(`/countries/${countryId}`);
  return res.data;
}
export async function findCity(cityId: number | string): Promise<void> {
  const res = await dashboardApi.get<void>(`/cities/${cityId}`);
  return res.data;
}
export async function findRegion(regionId: number | string): Promise<void> {
  const res = await dashboardApi.get<void>(`/regions/${regionId}`);
  return res.data;
}
export async function deleteCity(cityId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(`/cities/${cityId}`);
  return res.data;
}
export async function deleteRegion(regionId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(`/regions/${regionId}`);
  return res.data;
}
export async function getCitiesDropdown(
  countryId: number,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/cities/super-admin/dropdown/list/${countryId}`,
  );
  return res.data;
}
export async function getRegionsDropdown(
  cityId: number,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/regions/super-admin/dropdown/list/${cityId}`,
  );
  return res.data;
}
export async function getProgramsAndCoursesInInstitute(
  instituteId: number,
): Promise<ProgramsInInstituteResponse> {
  const res = await dashboardApi.get<ProgramsInInstituteResponse>(
    `/programs/super-admin/dropdown/inst-CP?instituteId=${instituteId}`,
  );
  return res.data;
}
export const createInstitute = async (formData) => {
  const { data } = await dashboardApi.post("/institutes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

type EditInstitutePayload = {
  instituteId: number | string;
  formData: FormData;
};

export const editInstitute = async ({
  instituteId,
  formData,
}: EditInstitutePayload) => {
  const { data } = await dashboardApi.patch(
    `/institutes/super-admin/institute/${instituteId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

export async function deleteInstitute(instituteId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/institutes/super-admin/institute/${instituteId}`,
  );
  return res.data;
}

export const getStudents = async (
  roleCategory: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(roleCategory && { roleCategory }),
    ...(search && { search }),
  });

  return dashboardApi.get(`/users/super-admin/users-list?${params.toString()}`);
};
export async function getStudentDetails(
  studentId: string,
): Promise<UserResponse> {
  const res = await dashboardApi.get<UserResponse>(
    `/users/super-admin/user/${studentId}`,
  );
  return res.data;
}

export async function createStudent(data): Promise<void> {
  const res = await dashboardApi.post<void>(`/users`, data);
  return res.data;
}
export async function createStudentToInstitute(data): Promise<void> {
  const res = await dashboardApi.post<void>(`/users/student`, data);
  return res.data;
}

export async function editStudent(data): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/users/super-admin/${data.student_id}`,
    data,
  );
  return res.data;
}

export async function deleteStudent(studentId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/users/super-admin/${studentId}`,
  );
  return res.data;
}
export async function instituteDetails(
  instituteId: string,
): Promise<instituteResponse> {
  const res = await dashboardApi.get<instituteResponse>(
    `/institutes/super-admin/institute/${instituteId}`,
  );
  return res.data;
}
export async function instituteOverview(instituteId: string) {
  const res = await dashboardApi.get(
    `/dashboard/institute-overview?instituteId=${instituteId}`,
  );
  return res.data;
}

// Programs
export async function getProgramsForAdmin(): Promise<ProgramsResponseForAdmin> {
  const res = await dashboardApi.get<ProgramsResponseForAdmin>(
    `/programs/super-admin/programs-list`,
  );
  return res.data;
}
export async function programDetailsForAdmin(
  instituteId: string,
): Promise<ProgramDetailsResponseForAdmin> {
  const res = await dashboardApi.get<ProgramDetailsResponseForAdmin>(
    `/programs/super-admin/program/${instituteId}`,
  );
  return res.data;
}
export async function getCoursesInProgram(
  programId: string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/courses/super-admin/dropdown/list?programId=${programId}`,
  );
  return res.data;
}
export async function getCoursesInProgramV2(
  programId: string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/courses/super-admin/program/${programId}/list`,
  );
  return res.data;
}

export async function deleteProgram(instituteId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/programs/super-admin/${instituteId}`,
  );
  return res.data;
}
export async function deleteCourseFromProgram(
  courseId: number | string,
  programId: number | string,
): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/courses/${courseId}/programs/${programId}`,
  );
  return res.data;
}

export const addProgram = async (values: any) => {
  const formData = new FormData();

  // logo
  formData.append("logo", values.logo);

  // translations
  values.translations.forEach((item: any, index: number) => {
    formData.append(`translations[${index}][languageId]`, item.languageId);
    formData.append(`translations[${index}][name]`, item.name);
    formData.append(`translations[${index}][description]`, item.description);
  });

  return dashboardApi.post("/programs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const editProgram = async (values: any) => {
  const formData = new FormData();

  // logo
  formData.append("logo", values.logo);

  // translations
  values.translations.forEach((item: any, index: number) => {
    formData.append(`translations[${index}][languageId]`, item.languageId);
    formData.append(`translations[${index}][name]`, item.name);
    formData.append(`translations[${index}][description]`, item.description);
  });

  return dashboardApi.patch(
    `/programs/super-admin/${values.programId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};
// DropDown List
export async function getInstitutesForDropdownList(): Promise<InstitutesCoursesResponse> {
  const res = await dashboardApi.get<InstitutesCoursesResponse>(
    `/institutes/super-admin/dropdown/list`,
  );
  return res.data;
}

// Courses
export async function getCoursesForDashboard(): Promise<CoursesForDashboardResponse> {
  const res = await dashboardApi.get<CoursesForDashboardResponse>(
    `/courses/super-admin/courses-list`,
  );
  return res.data;
}
export async function courseDetailsForDashboard(
  courseId: string,
): Promise<CourseDetailsResponseForDashboard> {
  const res = await dashboardApi.get<CourseDetailsResponseForDashboard>(
    `/courses/super-admin/course/${courseId}`,
  );
  return res.data;
}
export const addCourse = async (values: any) => {
  const formData = new FormData();

  // image
  if (values.image) {
    formData.append("image", values.image);
  }

  // notes
  formData.append("notes", values.notes);

  // translations
  values.translations.forEach((item: any, index: number) => {
    formData.append(`translations[${index}][name]`, item.name);
    formData.append(`translations[${index}][description]`, item.description);
    item.whatToLearn.forEach((learnItem: string, i: number) => {
      formData.append(`translations[${index}][whatToLearn][${i}]`, learnItem);
    });
    formData.append(`translations[${index}][durationTime]`, item.durationTime);
    formData.append(
      `translations[${index}][languageId]`,
      String(item.languageId),
    );
  });

  return dashboardApi.post("/courses", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const editCourse = async (values: any) => {
  const formData = new FormData();

  // image
  if (values.image) {
    formData.append("image", values.image);
  }

  // notes
  formData.append("notes", values.notes);

  // translations
  values.translations.forEach((item: any, index: number) => {
    formData.append(`translations[${index}][name]`, item.name);
    formData.append(`translations[${index}][description]`, item.description);
    item.whatToLearn.forEach((learnItem: string, i: number) => {
      formData.append(`translations[${index}][whatToLearn][${i}]`, learnItem);
    });
    formData.append(`translations[${index}][durationTime]`, item.durationTime);
    formData.append(
      `translations[${index}][languageId]`,
      String(item.languageId),
    );
  });

  return dashboardApi.patch(
    `courses/super-admin/${values?.courseId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};
// delete course
export async function deleteCourse(courseId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/courses/super-admin/${courseId}`,
  );
  return res.data;
}

// Learning Paths
export async function getLearningPathsForDashboard(): Promise<LearningPathsForDashboard> {
  const res = await dashboardApi.get<LearningPathsForDashboard>(
    `/packages/super-admin/packages-list`,
  );
  return res.data;
}
export async function learningPathForDashboard(
  learningPathId: string,
): Promise<LearningPathsForDashboardResponse> {
  const res = await dashboardApi.get<LearningPathsForDashboardResponse>(
    `/packages/super-admin/package/${learningPathId}`,
  );
  return res.data;
}

export async function deleteLearningPath(
  learningPathId: number,
): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/packages/super-admin/${learningPathId}`,
  );
  return res.data;
}

export const addLearningPath = async (values: any) => {
  const formData = new FormData();

  // image
  if (values.image) {
    formData.append("image", values.image);
  }
  // translations
  values.translations.forEach((item: any, index: number) => {
    formData.append(`translations[${index}][title]`, item.name);
    formData.append(`translations[${index}][description]`, item.description);
    formData.append(
      `translations[${index}][learning_outcoms]`,
      formatLinesToComma(item.whatToLearn),
    );

    formData.append(
      `translations[${index}][languageId]`,
      String(item.languageId),
    );
  });

  return dashboardApi.post("/packages", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const editLearningPath = async (values: any) => {
  const formData = new FormData();

  // image
  if (values.image) {
    formData.append("image", values.image);
  }
  // translations
  values.translations.forEach((item: any, index: number) => {
    formData.append(`translations[${index}][title]`, item.name);
    formData.append(`translations[${index}][description]`, item.description);
    formData.append(
      `translations[${index}][learning_outcoms]`,
      formatLinesToComma(item.whatToLearn),
    );

    formData.append(
      `translations[${index}][languageId]`,
      String(item.languageId),
    );
  });

  return dashboardApi.patch(
    `/packages/super-admin/${values.learningPathId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

// Expert Crud

export async function getExpertsForDashboard(): Promise<ExppertsForDashboardResponse> {
  const res = await dashboardApi.get<ExppertsForDashboardResponse>(
    `/educators/super-admin/educators-list`,
  );
  return res.data;
}
// dashboardApis.ts
export async function getStudentsInInstitute(
  instituteId: string,
  programId?: string,
  isActive?: string,
  page?: number,
  limit?: number,
  filterText?: string,
): Promise<InstituteStudentsResponse> {
  const params = new URLSearchParams();

  if (programId) params.append("programId", programId);
  if (isActive) params.append("isActive", isActive);
  if (filterText) params.append("search", filterText);

  const queryString = params.toString();
  const url = `/users/super-admin/institute/${instituteId}/students${queryString ? `?${queryString}` : ""}`;

  const res = await dashboardApi.get<InstituteStudentsResponse>(url, {
    params: {
      page,
      limit,
    },
  });
  return res.data;
}
export async function getExpertDetailsForDashboard(
  expertId: string,
): Promise<ExpertDetailsResponse> {
  const res = await dashboardApi.get<ExpertDetailsResponse>(
    `/educators/super-admin/educator/${expertId}`,
  );
  return res.data;
}
export async function getExpertCoursesDashboard(
  expertId: string,
): Promise<ExpertDetailsResponse> {
  const res = await dashboardApi.get<ExpertDetailsResponse>(
    `contents/super-admin/educator/${expertId}/list`,
  );
  return res.data;
}

export async function unAssignContentFromExpert(
  contentId: string | number,
): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/contents/${contentId}/educator`,
  );
  return res.data;
}

export async function deleteExpert(expertId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/educators/super-admin/${expertId}`,
  );
  return res.data;
}

export const addExpert = async (values: any) => {
  const formData = new FormData();

  // logo
  formData.append("image", values.image);
  formData.append("userId", values.userId);
  formData.append(`title`, values.title);
  formData.append(`bio`, values.bio);

  return dashboardApi.post("/educators", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const editExpert = async (values: any) => {
  const formData = new FormData();

  // logo
  formData.append("image", values.image);
  formData.append("userId", values.userId);
  formData.append(`title`, values.title);
  formData.append(`bio`, values.bio);

  return dashboardApi.patch(
    `/educators/super-admin/${values.userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

export async function getAllCoursesForDropdown(
  instituteId: number,
  programId: number,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/courses/super-admin/dropdown/list/program?programId=${programId}&instituteId=${instituteId}`,
  );
  return res.data;
}
export async function getAllCourses(
  programId: string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/courses/super-admin/dropdown/list?programId=${programId}`,
  );
  return res.data;
}
export async function getAllContentsForDropdown(
  courseId: string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/contents/super-admin/dropdown/list?courseId=${courseId}`,
  );
  return res.data;
}

export async function getAllProgramsForDropdown(
  instituteId: number | string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/programs/super-admin/dropdown/list?instituteId=${instituteId}`,
  );
  return res.data;
}
export async function getAllProgramsForStudent(
  instituteId: number | string,
): Promise<CitiesResponse> {
  const res = await dashboardApi(
    `/programs/super-admin/dropdown/user/list?instituteId=${instituteId}`,
  );
  return res.data;
}
export async function getExpertCourses(): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/contents/super-admin/educators/contents/dropdown`,
  );
  return res.data;
}
export async function getAllPrograms(
  instituteId: number | string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/programs/super-admin/dropdown/user/list?instituteId=${instituteId}`,
  );
  return res.data;
}

export async function assignCourseToInstituteProgram(
  courseId: number,
  programId: number,
  instituteId: number,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/courses/${courseId}/programs/${programId}/institutes/${instituteId}`,
  );
  return res.data;
}
export async function assignCourseToProgram(
  courseId: number,
  programId: number,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/courses/${courseId}/programs/${programId}`,
  );
  return res.data;
}
export async function assignContentToCourse(
  contentId: number,
  courseId: number,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/contents/${contentId}/course/${courseId}/assign`,
  );
  return res.data;
}
export async function assignProgramToInstitute(
  programId: number,
  instituteId: number,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/programs/${programId}/institutes/${instituteId}`,
  );
  return res.data;
}
export async function assignContentToExpert(
  educatorId: number,
  contnetId: number,
): Promise<void> {
  const res = await dashboardApi.post<void>(
    `/contents/${contnetId}/educator/${educatorId}/assign`,
  );
  return res.data;
}
export async function assignStudentToProgram(
  studentId: number | string,
  programId: number | string,
  instituteId: number | string,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `users/${studentId}/assign-program/${programId}?instituteId=${instituteId}`,
  );
  return res.data;
}
export async function unAssignProgramToInstitute(
  programId: number,
  instituteId: number,
): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/programs/${programId}/institutes/${instituteId}`,
  );
  return res.data;
}
export async function unAssignCourseToProgramToInstitute(
  courseId: number | string,
  programId: number | string,
  instituteId: number | string,
): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/courses/${courseId}/programs/${programId}/institutes/${instituteId}`,
  );
  return res.data;
}

export async function getConentsList(): Promise<ContentsResponse> {
  const res = await dashboardApi.get<ContentsResponse>(
    `/contents/super-admin/content-list`,
  );
  return res.data;
}
export const createContent = async (formData) => {
  const { data } = await dashboardApi.post("/contents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
export const editContent = async (contentId: number | string, formData) => {
  const { data } = await dashboardApi.patch(
    `/contents/super-admin/${contentId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

export async function getCategories(): Promise<CategoriesResponse> {
  const res = await dashboardApi.get<CategoriesResponse>(
    `/content-categories/super-admin/category-list`,
  );
  return res.data;
}
export async function getLanguages(): Promise<LanguagesResponse> {
  const res = await dashboardApi.get<LanguagesResponse>(
    `/languages/super-admin/languages-list`,
  );
  return res.data;
}

export async function instituteContentDetails(
  contentId: string,
): Promise<ContentDetailsResponse> {
  const res = await dashboardApi.get<ContentDetailsResponse>(
    `/contents/super-admin/content/${contentId}`,
  );
  return res.data;
}

export async function getTopicsWithLessonsInContent(
  contentId: number | string,
): Promise<TopicsResponse> {
  const res = await dashboardApi.get<TopicsResponse>(
    `/topics/${contentId}/topics`,
  );
  return res.data;
}
export async function deleteLesson(lessonId: string | number): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/lessons/super-admin/${lessonId}`,
  );
  return res.data;
}

export async function createTopic(data): Promise<void> {
  const res = await dashboardApi.post<void>(`/topics`, data);
  return res.data;
}
export async function editTopic(data): Promise<void> {
  const res = await dashboardApi.post<void>(
    `/topics/super-admin/${data.topicId}`,
    data,
  );
  return res.data;
}
export async function getTopicDetails(
  contentId: number | string,
  topicId: number | string,
): Promise<TopicResponse> {
  const res = await dashboardApi.get<TopicResponse>(
    `/topics/super-admin/topic/${topicId}?contentId=${contentId}`,
  );
  return res.data;
}

export async function deleteTopicApi(topicId: string | number): Promise<void> {
  const res = await dashboardApi.delete<void>(`/topics/super-admin/${topicId}`);
  return res.data;
}

export const createLesson = async (formData) => {
  const { data } = await dashboardApi.post("/lessons", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
export const editLesson = async (formData) => {
  const lessonId = formData.get("lessonId");

  const { data } = await dashboardApi.patch(
    `/lessons/super-admin/${lessonId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

export async function getAllRoles(
  page: number,
  limit: number,
): Promise<RolesListResponse> {
  const res = await dashboardApi.get<RolesListResponse>(
    `/system-roles/super-admin/roles-list?limit=${limit}&page=${page}`,
  );
  return res.data;
}
export async function getRoleCategories(): Promise<RoleCategoriesResponse> {
  const res = await dashboardApi.get<RoleCategoriesResponse>(
    `/system-roles/super-admin/role-categories`,
  );
  return res.data;
}
export async function findOneRole(
  roleId: string,
): Promise<RolesDetailsResponse> {
  const res = await dashboardApi.get<RolesDetailsResponse>(
    `/system-roles/super-admin/role/${roleId}`,
  );
  return res.data;
}
export async function createRole(data): Promise<void> {
  const res = await dashboardApi.post<void>(`/system-roles`, data);
  return res.data;
}
export async function updateRole(data): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/system-roles/super-admin/${data.roleId}`,
    data,
  );
  return res.data;
}
export async function deleteRole(roleId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/system-roles/super-admin/${roleId}`,
  );
  return res.data;
}
export function logoutDashboardUser() {
  return dashboardApi.post("/system-auth/logout");
}

export async function getAllSystemUsers(): Promise<SystemUsersResponse> {
  const res = await dashboardApi.get<SystemUsersResponse>(
    `/system-users/super-admin/users/list`,
  );
  return res.data;
}
export async function findOneSystemUser(
  systemUserId: string,
): Promise<SystemUserResponse> {
  const res = await dashboardApi.get<SystemUserResponse>(
    `/system-users/super-admin/user/${systemUserId}`,
  );
  return res.data;
}
export async function createSystemUser(data): Promise<void> {
  const res = await dashboardApi.post<void>(`/system-users`, data);
  return res.data;
}
export async function editSystemUser(data): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/system-users/super-admin/user/${data.systemUserId}`,
    data,
  );
  return res.data;
}
export async function deleteSystemUser(systemUserId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/system-users/super-admin/user/${systemUserId}`,
  );
  return res.data;
}
export async function getLessonDetailsForDashboard(
  lessonId: string,
  topicId: string,
): Promise<LessonDetailsResponse> {
  const res = await dashboardApi.get<LessonDetailsResponse>(
    `/lessons/super-admin/lesson/${lessonId}?topicId=${topicId}`,
  );
  return res.data;
}
export async function getQuizQuestions(quizId: string): Promise<QuizQuestion> {
  const res = await dashboardApi.get<QuizQuestion>(
    `/questions/super-admin/questions/${quizId}`,
  );
  return res.data;
}

export async function createNewQuestion(data): Promise<void> {
  const res = await dashboardApi.post<void>(`/questions`, data);
  return res.data;
}

export async function getContentsForTrainingPath(
  trainingPathId: string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/contents/super-admin/package/${trainingPathId}/list`,
  );
  return res.data;
}
export async function getContentsForCourses(
  courseId: string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/contents/super-admin/course/${courseId}/list`,
  );
  return res.data;
}
export async function getAllContentsDropdownForTrainingPath(
  trainingPathId: string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get<CitiesResponse>(
    `/packages-contents/packages/${trainingPathId}/contents/dropdown`,
  );
  return res.data;
}

export async function assignTraningCourseToLearningPath(
  learningPathId: string | number,
  contentId: string | number,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/packages-contents/${learningPathId}/contents/${contentId}/assign`,
  );
  return res.data;
}
export async function unassignTraningCourseToLearningPath(
  learningPathId: string | number,
  contentId: string | number,
): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/packages-contents/${learningPathId}/contents/${contentId}/un-assign`,
  );
  return res.data;
}
export async function unassignTraningCourseToCourse(
  courseId: string | number,
  contentId: string | number,
): Promise<void> {
  const res = await dashboardApi.delete<void>(
    `/contents/${contentId}/course/${courseId}/unassign`,
  );
  return res.data;
}

export const activateStudent = async (
  studentId: string,
  data: { note: string; reasonId: number },
) => {
  const response = await dashboardApi.post(
    `/users/${studentId}/activate`,
    data,
  );
  return response.data;
};

export const deactivateStudent = async (
  studentId: string,
  data: { note: string; reasonId: number },
) => {
  const response = await dashboardApi.post(
    `/users/${studentId}/deactivate`,
    data,
  );
  return response.data;
};

export async function systemUserActiveToggle(
  systemUserId: number,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/system-users/super-admin/system-user-status/${systemUserId}`,
  );
  return res.data;
}
export async function instituteActiveToggle(
  instituteId: number | string,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/institutes/super-admin/institute-status/${instituteId}`,
  );
  return res.data;
}
export async function courseActiveToggle(
  courseId: number | string,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/courses/super-admin/course-status/${courseId}`,
  );
  return res.data;
}
export async function roleActiveToggle(roleId: number): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/system-roles/super-admin/role-status/${roleId}`,
  );
  return res.data;
}
export async function trainingCourseToggle(
  trainingCourseId: number,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/contents/super-admin/content-status/${trainingCourseId}`,
  );
  return res.data;
}
export const fetchBatchResult = async (batchId: number | string) => {
  const { data } = await dashboardApi.get(`/users-batch-upload/${batchId}`);
  return data.data;
};

interface GetInstituteStaffParams {
  programId?: string;
  isActive?: string;
}
export const getInstituteStaff = async (
  instituteId: string,
  params: GetInstituteStaffParams = {},
) => {
  const queryParams = new URLSearchParams();

  if (params.programId) {
    queryParams.append("programId", params.programId);
  }

  if (params.isActive) {
    queryParams.append("isActive", params.isActive);
  }
  if (params.search) {
    queryParams.append("search", params.search);
  }

  const queryString = queryParams.toString();
  const url = `/users/super-admin/institute/${instituteId}/stuff${queryString ? `?${queryString}` : ""}`;

  const response = await dashboardApi.get(url);
  return response.data;
};

export const getProgramInstitutes = async (programId: string) => {
  const response = await dashboardApi.get(
    `/programs/super-admin/program/${programId}/institutes`,
  );
  return response.data;
};

export const getProgramsForCourse = async (courseId: string) => {
  const response = await dashboardApi.get(
    `/programs/super-admin/course/${courseId}/programs`,
  );
  return response.data;
};
export const getOverallProgress = async (studentId: string) => {
  const response = await dashboardApi.get(`/dashboard/overall/${studentId}`);
  return response.data;
};
export const getPassedExamsAverage = async (studentId: string) => {
  const response = await dashboardApi.get(
    `/dashboard/passed-exams/${studentId}`,
  );
  return response.data;
};
export const getStudentContentsProgress = async (studentId: string) => {
  const response = await dashboardApi.get(
    `/dashboard/student-contents-progress/${studentId}`,
  );
  return response.data;
};
export const getStudentCoursesProgressSummary = async (studentId: string) => {
  const response = await dashboardApi.get(
    `/dashboard/student-courses-progress-summary/${studentId}`,
  );
  return response.data;
};
export const getExamResults = async (studentId: string) => {
  const response = await dashboardApi.get(
    `/dashboard/exam-results/${studentId}`,
  );
  return response.data;
};
export const getStudentLearningPaths = async (studentId: string) => {
  const response = await dashboardApi.get(
    `/package-enrollments/${studentId}/completion-status`,
  );
  return response.data;
};

export async function getTotalTrainingCoursesCount(
  programId: number | string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get(`/contents/super-admin/contents/count`, {
    params: {
      programId,
    },
  });
  return res.data;
}
export async function getTotalStudentsCountData(
  programId: number | string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get(`/users/super-admin/students/count`, {
    params: {
      programId,
    },
  });
  return res.data;
}
export async function getTotalCoursesCount(
  programId: number | string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get(`/courses/super-admin/count`, {
    params: {
      programId,
    },
  });
  return res.data;
}
export async function getTotalInstitutes(
  programId: number | string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get(`/dashboard/total-institutes`, {
    params: {
      programId,
    },
  });
  return res.data;
}
export async function getTotalAiContentGenrated(
  programId: number | string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get(`/dashboard/ai-contents/count`, {
    params: {
      programId,
    },
  });
  return res.data;
}
export async function getTotalActiveStudents(
  programId: number | string,
): Promise<CitiesResponse> {
  const res = await dashboardApi.get(`/dashboard/active-students`, {
    params: {
      programId,
    },
  });
  return res.data;
}

export interface ChartSeries {
  name: string;
  data: number[];
}

export interface ChartData {
  categories: string[];
  series: ChartSeries[];
}

export interface ChartApiResponse {
  status: number;
  message: string;
  data: ChartData;
}

const buildParams = (programId?: number) =>
  programId !== undefined ? { programId } : {};

export const fetchStudentEngagement = async (
  programId?: number,
): Promise<ChartData> => {
  const { data } = await dashboardApi.get<ChartApiResponse>(
    "/dashboard/student-engagement",
    { params: buildParams(programId) },
  );
  return data.data;
};
export const fetchStudentActivityTrend = async (
  programId?: number,
): Promise<ChartData> => {
  const { data } = await dashboardApi.get<{
    status: number;
    message: string;
    data: {
      year: number;
      instituteId: number;
      months: {
        month: string;
        monthNumber: number;
        enrollmentsCount: number;
      }[];
    };
  }>("/dashboard/students-activity-trend", { params: buildParams(programId) });

  return {
    categories: data.data.months.map((m) => m.month),
    series: [
      {
        name: "Weekly Active Students",
        data: data.data.months.map((m) => m.enrollmentsCount),
      },
    ],
  };
};

export const fetchCertificatesIssued = async (
  programId?: number,
): Promise<ChartData> => {
  const { data } = await dashboardApi.get<ChartApiResponse>(
    "/dashboard/certificates-issued",
    { params: buildParams(programId) },
  );
  return data.data;
};

export const fetchPackagesCompleted = async (
  programId?: number,
): Promise<ChartData> => {
  const { data } = await dashboardApi.get<ChartApiResponse>(
    "/dashboard/packages-completed",
    { params: buildParams(programId) },
  );
  return data.data;
};

export const fetchActivationReasons = async (type?: string) => {
  const { data } = await dashboardApi.get(`/activation-reasons?type=${type}`);
  return data.data;
};

interface ApplyMessageData {
  institute_name: string;
  contact_person: string;
  email_address: string;
  phone_number: string;
  about_your_institute: string;
}

export async function createApplyMessage(
  data: ApplyMessageData,
): Promise<void> {
  const res = await dashboardApi.post<void>(`/apply-messages`, data);
  return res.data;
}

export const getStudentCertificates = async (studentId: string) => {
  const response = await dashboardApi.get(
    `/dashboard/student-certificates/${studentId}`,
  );
  return response.data;
};
export const fetchTopFaculty = async () => {
  const response = await dashboardApi.get(`/dashboard/top-faculty-members`);
  return response.data;
};
export const fetchProgramCourse = async () => {
  const response = await dashboardApi.get(
    `/dashboard/program-course-completion?limit=5`,
  );
  return response.data;
};
export const fetchContentCompletion = async () => {
  const response = await dashboardApi.get(
    `/dashboard/content-completion?limit=10`,
  );
  return response.data;
};
export const fetchStudentsWithoutCourse = async () => {
  const response = await dashboardApi.get(
    `/dashboard/students-without-course-after-3-months`,
  );
  return response.data;
};
export const fetchInstitutesExpiringWithinMonth = async () => {
  const response = await dashboardApi.get(
    `/dashboard/institutes-expiring-within-month`,
  );
  return response.data;
};
export const fetchInstitutesWithHighNoCourseStudents = async () => {
  const response = await dashboardApi.get(
    `/dashboard/institutes-with-high-no-course-students?threshold=1`,
  );
  return response.data;
};

export const fetchTopContentCategories = async () => {
  const response = await dashboardApi.get(
    `/dashboard/top-content-categories-enrollments`,
  );
  return response.data;
};
export const fetchTopInstitutesEngagement = async () => {
  const response = await dashboardApi.get(
    `/dashboard/top-institutes-engagement`,
  );
  return response.data;
};
export const fetchPlans = async (onlyActive: boolean) => {
  const url = onlyActive
    ? "/subscription-plans?onlyActive=1"
    : "/subscription-plans";
  const response = await dashboardApi.get(url);
  return response.data;
};
export const fetchPlansCount = async () => {
  const response = await dashboardApi.get("/subscription-plans/stats/total");
  return response.data;
};
export const totalActivePlans = async () => {
  const response = await dashboardApi.get("/subscription-plans/stats/active");
  return response.data;
};
export const totalInActivePlans = async () => {
  const response = await dashboardApi.get("/subscription-plans/stats/inactive");
  return response.data;
};
export const totalInstitutesUsingPlans = async () => {
  const response = await dashboardApi.get(
    "/subscription-plans/stats/institutes-using-plans",
  );
  return response.data;
};
export const fetchPlanById = async (planId: string | number) => {
  const response = await dashboardApi.get(`/subscription-plans/${planId}`);
  return response.data;
};
export const fetchPlanInstitutes = async (planId: string | number) => {
  const response = await dashboardApi.get(
    `/subscription-plans/${planId}/institutes`,
  );
  return response.data;
};
export async function planActivateToggle(
  planId: number | string,
): Promise<void> {
  const res = await dashboardApi.patch<void>(
    `/subscription-plans/${planId}/toggle-status`,
  );
  return res.data;
}
export async function deletePlan(planId: number): Promise<void> {
  const res = await dashboardApi.delete<void>(`/subscription-plans/${planId}`);
  return res.data;
}
type PlanData = {
  plan_name: string;
  min_students: number;
  max_students: number;
  default_price_per_student: number;
  administrative_fees: number;
  default_installments_count: number;
  is_active: boolean;
  description: string;
};
export async function createSubscriptionPlan(data: PlanData) {
  const res = await dashboardApi.post(`/subscription-plans`, data);
  return res.data;
}
export async function updateSubscriptionPlan(
  id: string,
  data: PlanData,
): Promise<void> {
  const res = await dashboardApi.patch<void>(`/subscription-plans/${id}`, data);
  return res.data;
}

export async function fetchContracts(params: {
  page?: number;
  limit?: number;
  Year?: number;
  instituteId?: number;
  status?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.Year) query.set("Year", String(params.Year));
  if (params.instituteId) query.set("instituteId", String(params.instituteId));
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  const res = await dashboardApi.get(
    `/institute-annual-contracts?${query.toString()}`,
  );
  return res.data.data;
}

export async function fetchInstitutesForSelect(): Promise<
  { id: number; name: string }[]
> {
  const res = await dashboardApi.get(`/institutes?limit=100`);
  return res.data.data?.items ?? res.data.data ?? [];
}

export async function fetchContractById(id: string) {
  const res = await dashboardApi.get(`/institute-annual-contracts/${id}`);
  return res.data.data;
}
