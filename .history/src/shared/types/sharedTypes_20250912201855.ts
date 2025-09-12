export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};
export type PaginationType = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
export type ApiResponseWithPagination<T> = {
  status: number;
  message: string;
  data: { data: T; pagination: T };
};
export type CourseType = {
  id: number;
  description: string;
  category?: string;
  name: string;
  rate?: number;
  reviews?: number;
  levelName?: string;
  image?: string;
  educators: Educator[];
};

export type Educator = {
  id: number;
  title: string;
  bio: string;
  image: string;
  firstName: string;
  lastName: string;
};

export type ProgramsType = {
  id: number;
  description: string;
  name: string;
};

export type ProgramsResponse = {
  formattedPrograms: ProgramsType[];
  pagination: PaginationType;
};

export type CoursesResponse = {
  formattedCourses: CourseType[];
  pagination: PaginationType;
};
export type ExpertsResponse = {
  data: ExpertsData[];
  pagination: PaginationType;
};

export type TestimonialsTypes = {
  id: number;
  name: string;
  description: string;
  image?: string;
};
export type ExpertsData = {
  id: number;
  title: string;
  image: string;
  bio: string;
};
