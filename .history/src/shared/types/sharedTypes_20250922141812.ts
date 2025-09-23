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
export type LevelName = "Beginner" | "Mid" | "Advanced";

export type CourseType = {
  id: number;
  description: string;
  category?: { name: string; id: string };
  name: string;
  rate?: number;
  reviews?: number;
  levelName?: LevelName;
  image?: string;
  educators: Educator[];
  durationTime: string;
  lessonsCount: number;
  completedLessonsCount: number;
  whatToLearn: [];
};

export type CourseContent = {
  id: string | number;
  name: string;
  rate?: number;
  lessonsCount?: number;
  completedLessonsCount?: number;
};

export type ContentDetailsType = {
  durationTime: string;
  levelName: string;
  name: string;
  description: string;
  educators: Educator[];
  whatToLearn: string[];
  topic: TopicsType[];
};

export type TopicsType = {};

export type ContinueCourseType = {
  educators: Educator[];
  content: CourseContent;
  lessonId: string | number;
  imageUrl?: string;
  lessonName?: string;
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
  formattedContents: CourseType[];
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

export type TokenPayload = {
  email: string;
};
