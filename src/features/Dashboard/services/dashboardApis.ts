import api from "@/shared/services/axios";
import type {
  CourseDetailsResponseForDashboard,
  CoursesForDashboardResponse,
  instituteResponse,
  InstitutesCoursesResponse,
  InstitutesResponse,
  LearningPathsForDashboard,
  LearningPathsForDashboardResponse,
  LearningPathType,
  ProgramDetailsResponseForAdmin,
  ProgramsResponseForAdmin,
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
export async function instituteDetails(
  instituteId: string
): Promise<instituteResponse> {
  const res = await api.get<instituteResponse>(
    `/institutes/super-admin/institute/${instituteId}`
  );
  return res.data;
}

// Programs
export async function getProgramsForAdmin(): Promise<ProgramsResponseForAdmin> {
  const res = await api.get<ProgramsResponseForAdmin>(
    `/programs/super-admin/programs-list`
  );
  return res.data;
}
export async function programDetailsForAdmin(
  instituteId: string
): Promise<ProgramDetailsResponseForAdmin> {
  const res = await api.get<ProgramDetailsResponseForAdmin>(
    `/programs/super-admin/program/${instituteId}`
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
    `/institutes/super-admin/dropdown/list`
  );
  return res.data;
}

// Courses
export async function getCoursesForDashboard(): Promise<CoursesForDashboardResponse> {
  const res = await api.get<CoursesForDashboardResponse>(
    `/courses/super-admin/courses-list`
  );
  return res.data;
}
export async function courseDetailsForDashboard(
  courseId: string
): Promise<CourseDetailsResponseForDashboard> {
  const res = await api.get<CourseDetailsResponseForDashboard>(
    `/courses/super-admin/course/${courseId}`
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
      String(item.languageId)
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
      String(item.languageId)
    );
  });

  return api.patch(
    `/institutes/super-admin/institute/${values?.courseId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
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
    `/packages/super-admin/packages-list`
  );
  return res.data;
}
export async function learningPathForDashboard(
  learningPathId: string
): Promise<LearningPathsForDashboardResponse> {
  const res = await api.get<LearningPathsForDashboardResponse>(
    `/packages/super-admin/package/${learningPathId}`
  );
  return res.data;
}

export async function deleteLearningPath(
  learningPathId: number
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
      item.whatToLearn
    );

    formData.append(
      `translations[${index}][languageId]`,
      String(item.languageId)
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
      item.whatToLearn
    );

    formData.append(
      `translations[${index}][languageId]`,
      String(item.languageId)
    );
  });

  return api.patch(`/packages/super-admin/${values.learningPathId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
