export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};
export type ApiResponseWithPagination<T> = {
  status: number;
  message: string;
  data: { data: T };
};
export type CourseTypes = {
  id: number;
  description: string;
  category: string;
  name: string;
  instructor: string;
  rating: number;
  reviews: number;
  level: string;
  image?: string;
};
export type TestimonialsTypes = {
  id: number;
  category: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  level: string;
  image?: string;
};
export type ExpertsData = {
  id: number;
  title: string;
  image: string;
  bio: string;
};
