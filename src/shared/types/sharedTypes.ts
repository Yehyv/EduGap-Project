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
  ad_video?: string;
};

export type CourseContent = {
  id: string | number;
  name: string;
  rate?: number;
  lessonsCount?: number;
  completedLessonsCount?: number;
};

export type ContentDetailsType = {
  id: number;
  name: string;
  isSaved: boolean;
  totalDuration: string;
  previousBackground: string;
  levelName: string;
  description: string;
  educator: Educator;
  whatToLearn: string;
  topic: TopicsType[];
  adVideo: string;
  languageType: string;
  lastUpdate: string;
};
export type ContentAccessType = {
  access: string;
  enrollmentId: number;
};
export type ContentLessonType = {
  id: number;
  name: string;
  video: string;
};
export type ContentTopicsType = {
  id: number;
  name: string;
  duration: number;
  lessons: LessonType[];
};
export type ContentEducatorType = {
  educator: Educator;
};
export type MyNotesInLessonType = {
  id: number;
  notes: string;
  created_at: string;
  updated_at: string;
  lessonId: number;
  contentId: number;
};
export type MyNotesInLessonTypeResponse = {
  items: MyNotesInLessonType[];
  pagination: PaginationType;
};
export type HistogramType = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};
export type ContentRatingsType = {
  histogram: HistogramType;
  average: number;
  totalRaters: number;
};
export type ContentReviews = {
  id: number;
  review: string;
  createdAt: string;
  user: {
    id: number;
    full_name: string;
    image: string;
  };
  rating: number;
};
export type ContentReviewsResponse = {
  reviews: ContentReviews[];
  pagination: PaginationType;
};

export type TopicsType = {
  id: number;
  lessons: LessonType[];
  name: string;
};

export type LessonType = {
  id: number;
  name: string;
  duration: number;
};

export type ContinueCourseType = {
  educators: Educator[];
  content: CourseContent;
  lessonId: string | number;
  imageUrl?: string;
  lessonName?: string;
};
export type InstituteCoursesType = {
  id: number;
  image: string;
  name: string;
  description: string;
  contentsCount: number;
  totalDuration: number;
};
export type InstituteCoursesResponse = {
  items: InstituteCoursesType[];
  pagination: PaginationType;
};

export type Educator = {
  id: number;
  title: string;
  bio: string;
  image: string;
  firstName: string;
  lastName: string;
  name: string;
  rate?: number;
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
export type CurrentUserRating = {
  rating: number;
};
export type lessonActionsHistory = {
  lessonId: number;
  reactionStatus: string;
  savedStatus: string;
};
export type CommentsType = {
  id: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    full_name: string;
    image: string;
  };
};
export type CommentsTypeResponse = {
  items: CommentsType[];
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
