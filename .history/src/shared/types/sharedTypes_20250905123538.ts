export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};
export type CourseTypes = {
  id: number;
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
  category: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  level: string;
  image?: string;
};
