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
  level?: LevelName;
  image?: string;
  educator: Educator;
  totalDuration: string;
  whatToLearn: [];
  enrollmentsCount: number;
  ratersCount: number;
  isSaved: boolean;
  isEnrolled: boolean;
};

export type CourseContent = {
  id: string | number;
  name: string;
  rate?: number;
  lessonsCount?: number;
  completedLessonsCount?: number;
};

export type ContentDetailsType = {
  name: string;
  durationTime: string;
  levelName: string;
  description: string;
  educators: Educator[];
  whatToLearn: string[];
  topic: TopicsType[];
  adVideo: string;
};

export type TopicsType = {
  id: number;
  lessons: LessonType[];
  name: string;
};

export type LessonType = {
  id: number;
  name: string;
};

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
  name: string;
};

export type ProgramsType = {
  id: number;
  description: string;
  title: string;
  contentsCount: number;
  totalDuration: number;
  image: string;
};

export type ProgramsResponse = {
  items: ProgramsType[];
  pagination: PaginationType;
};

export type CoursesResponse = {
  items: CourseType[];
  pagination: PaginationType;
};
export type ExpertsResponse = {
  items: ExpertsData[];
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
