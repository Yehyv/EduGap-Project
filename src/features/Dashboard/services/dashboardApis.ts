import api from "@/shared/services/axios";
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
  LanguagesResponse,
  LearningPathsForDashboard,
  LearningPathsForDashboardResponse,
  ProgramDetailsResponseForAdmin,
  ProgramsInInstituteResponse,
  ProgramsResponseForAdmin,
  TopicResponse,
  TopicsResponse,
  UserResponse,
  UsersResponse,
} from "../types/dashboardTypes";
import type { ExpertsResponse } from "@/shared/types/sharedTypes";

export async function getInstitutes(): Promise<InstitutesResponse> {
  const res = await api.get<InstitutesResponse>(
    `/institutes/super-admin/institutes-list`,
  );
  return res.data;
}

export async function getInstitutesCoursesForDashboard(): Promise<InstitutesCoursesResponse> {
  const res = await api.get<InstitutesCoursesResponse>(
    `/courses/super-admin/courses-list`,
  );
  return res.data;
}
export async function getCountriesDropdown(): Promise<CountriesResponse> {
  const res = await api.get<CountriesResponse>(
    `/countries/super-admin/dropdown/list`,
  );
  return res.data;
}
export async function getCitiesDropdown(
  countryId: number,
): Promise<CitiesResponse> {
  const res = await api.get<CitiesResponse>(
    `/cities/super-admin/dropdown/list/${countryId}`,
  );
  return res.data;
}
export async function getRegionsDropdown(
  cityId: number,
): Promise<CitiesResponse> {
  const res = await api.get<CitiesResponse>(
    `/regions/super-admin/dropdown/list/${cityId}`,
  );
  return res.data;
}
export async function getProgramsAndCoursesInInstitute(
  instituteId: number,
): Promise<ProgramsInInstituteResponse> {
  const res = await api.get<ProgramsInInstituteResponse>(
    `/programs/super-admin/dropdown/inst-CP?instituteId=${instituteId}`,
  );
  return res.data;
}
export const createInstitute = async (formData) => {
  const { data } = await api.post("/institutes", formData, {
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
  const { data } = await api.patch(
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
  const res = await api.delete<void>(
    `/institutes/super-admin/institute/${instituteId}`,
  );
  return res.data;
}

export async function getStudents(): Promise<UsersResponse> {
  const res = await api.get<UsersResponse>(`/users/super-admin/users-list`);
  return res.data;
}
export async function getStudentDetails(
  studentId: string,
): Promise<UserResponse> {
  const res = await api.get<UserResponse>(
    `/users/${studentId}/super-admin/user`,
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
export async function instituteDetails(
  instituteId: string,
): Promise<instituteResponse> {
  const res = await api.get<instituteResponse>(
    `/institutes/super-admin/institute/${instituteId}`,
  );
  return res.data;
}

// Programs
export async function getProgramsForAdmin(): Promise<ProgramsResponseForAdmin> {
  const res = await api.get<ProgramsResponseForAdmin>(
    `/programs/super-admin/programs-list`,
  );
  return res.data;
}
export async function programDetailsForAdmin(
  instituteId: string,
): Promise<ProgramDetailsResponseForAdmin> {
  const res = await api.get<ProgramDetailsResponseForAdmin>(
    `/programs/super-admin/program/${instituteId}`,
  );
  return res.data;
}
export async function getCoursesInProgram(
  programId: string,
): Promise<CitiesResponse> {
  const res = await api.get<CitiesResponse>(
    `/courses/super-admin/dropdown/list/program?programId=${programId}`,
  );
  return res.data;
}

export async function deleteProgram(instituteId: number): Promise<void> {
  const res = await api.delete<void>(`/programs/super-admin/${instituteId}`);
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

  return api.post("/programs", formData, {
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

  return api.patch(`/programs/super-admin/${values.programId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
// DropDown List
export async function getInstitutesForDropdownList(): Promise<InstitutesCoursesResponse> {
  const res = await api.get<InstitutesCoursesResponse>(
    `/institutes/super-admin/dropdown/list`,
  );
  return res.data;
}

// Courses
export async function getCoursesForDashboard(): Promise<CoursesForDashboardResponse> {
  const res = await api.get<CoursesForDashboardResponse>(
    `/courses/super-admin/courses-list`,
  );
  return res.data;
}
export async function courseDetailsForDashboard(
  courseId: string,
): Promise<CourseDetailsResponseForDashboard> {
  const res = await api.get<CourseDetailsResponseForDashboard>(
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

  return api.post("/courses", formData, {
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

  return api.patch(
    `/institutes/super-admin/institute/${values?.courseId}`,
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
  const res = await api.delete<void>(`/courses/super-admin/${courseId}`);
  return res.data;
}

// Learning Paths
export async function getLearningPathsForDashboard(): Promise<LearningPathsForDashboard> {
  const res = await api.get<LearningPathsForDashboard>(
    `/packages/super-admin/packages-list`,
  );
  return res.data;
}
export async function learningPathForDashboard(
  learningPathId: string,
): Promise<LearningPathsForDashboardResponse> {
  const res = await api.get<LearningPathsForDashboardResponse>(
    `/packages/super-admin/package/${learningPathId}`,
  );
  return res.data;
}

export async function deleteLearningPath(
  learningPathId: number,
): Promise<void> {
  const res = await api.delete<void>(`/packages/super-admin/${learningPathId}`);
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
      item.whatToLearn,
    );

    formData.append(
      `translations[${index}][languageId]`,
      String(item.languageId),
    );
  });

  return api.post("/packages", formData, {
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
      item.whatToLearn,
    );

    formData.append(
      `translations[${index}][languageId]`,
      String(item.languageId),
    );
  });

  return api.patch(`/packages/super-admin/${values.learningPathId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Expert Crud

export async function getExpertsForDashboard(): Promise<ExppertsForDashboardResponse> {
  const res = await api.get<ExppertsForDashboardResponse>(
    `/educators/super-admin/educators-list`,
  );
  return res.data;
}
export async function getExpertDetailsForDashboard(
  expertId: string,
): Promise<ExpertDetailsResponse> {
  const res = await api.get<ExpertDetailsResponse>(
    `/educators/super-admin/educator/${expertId}`,
  );
  return res.data;
}

export async function deleteExpert(expertId: number): Promise<void> {
  const res = await api.delete<void>(`/educators/super-admin/${expertId}`);
  return res.data;
}

export const addExpert = async (values: any) => {
  const formData = new FormData();

  // logo
  formData.append("image", values.image);
  formData.append("userId", values.userId);
  formData.append(`title`, values.title);
  formData.append(`bio`, values.bio);

  return api.post("/educators", formData, {
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

  return api.patch(`/educators/super-admin/${values.userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export async function getAllCoursesForDropdown(
  programId: number,
): Promise<CitiesResponse> {
  const res = await api.get<CitiesResponse>(
    `/courses/super-admin/dropdown/list/program?programId=${programId}`,
  );
  return res.data;
}
export async function getAllCourses(): Promise<CitiesResponse> {
  const res = await api.get<CitiesResponse>(
    `/courses/super-admin/dropdown/list`,
  );
  return res.data;
}
export async function getAllContentsForDropdown(): Promise<CitiesResponse> {
  const res = await api.get<CitiesResponse>(
    `/contents/super-admin/dropdown/list`,
  );
  return res.data;
}
export async function getAllProgramsForDropdown(): Promise<CitiesResponse> {
  const res = await api.get<CitiesResponse>(
    `/programs/super-admin/dropdown/list`,
  );
  return res.data;
}

export async function assignCourseToInstituteProgram(
  courseId: number,
  programId: number,
  instituteId: number,
): Promise<void> {
  const res = await api.patch<void>(
    `/courses/${courseId}/programs/${programId}/institutes/${instituteId}`,
  );
  return res.data;
}
export async function assignCourseToProgram(
  courseId: number,
  programId: number,
): Promise<void> {
  const res = await api.patch<void>(
    `/courses/${courseId}/programs/${programId}`,
  );
  return res.data;
}
export async function assignContentToCourse(
  contentId: number,
  courseId: number,
): Promise<void> {
  const res = await api.patch<void>(
    `/contents/${contentId}/course/${courseId}/assign`,
  );
  return res.data;
}
export async function assignProgramToInstitute(
  programId: number,
  instituteId: number,
): Promise<void> {
  const res = await api.patch<void>(
    `/programs/${programId}/institutes/${instituteId}`,
  );
  return res.data;
}
export async function unAssignProgramToInstitute(
  programId: number,
  instituteId: number,
): Promise<void> {
  const res = await api.delete<void>(
    `/programs/${programId}/institutes/${instituteId}`,
  );
  return res.data;
}
export async function unAssignCourseToProgramToInstitute(
  courseId: number | string,
  programId: number | string,
  instituteId: number | string,
): Promise<void> {
  const res = await api.delete<void>(
    `/courses/${courseId}/programs/${programId}/institutes/${instituteId}`,
  );
  return res.data;
}

export async function getConentsList(): Promise<ContentsResponse> {
  const res = await api.get<ContentsResponse>(
    `/contents/super-admin/content-list`,
  );
  return res.data;
}
export const createContent = async (formData) => {
  const { data } = await api.post("/contents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
export const editContent = async (contentId: number | string, formData) => {
  const { data } = await api.patch(
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
  const res = await api.get<CategoriesResponse>(
    `/content-categories/super-admin/category-list`,
  );
  return res.data;
}
export async function getLanguages(): Promise<LanguagesResponse> {
  const res = await api.get<LanguagesResponse>(
    `/languages/super-admin/languages-list`,
  );
  return res.data;
}

export async function instituteContentDetails(
  contentId: string,
): Promise<ContentDetailsResponse> {
  const res = await api.get<ContentDetailsResponse>(
    `/contents/super-admin/content/${contentId}`,
  );
  return res.data;
}

export async function getTopicsWithLessonsInContent(
  contentId: number | string,
): Promise<TopicsResponse> {
  const res = await api.get<TopicsResponse>(`/topics/${contentId}/topics`);
  return res.data;
}

export async function createTopic(data): Promise<void> {
  const res = await api.post<void>(`/topics`, data);
  return res.data;
}
export async function editTopic(data): Promise<void> {
  const res = await api.post<void>(`/topics/super-admin/${data.topicId}`, data);
  return res.data;
}
export async function getTopicDetails(
  contentId: number | string,
  topicId: number | string,
): Promise<TopicResponse> {
  const res = await api.get<TopicResponse>(
    `/topics/super-admin/topic/${topicId}?contentId=${contentId}`,
  );
  return res.data;
}

export async function deleteTopicApi(topicId: string | number): Promise<void> {
  const res = await api.delete<void>(`/topics/super-admin/${topicId}`);
  return res.data;
}

export const createLesson = async (formData) => {
  const { data } = await api.post("/lessons", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
