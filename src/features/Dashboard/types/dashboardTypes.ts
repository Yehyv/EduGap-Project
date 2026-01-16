import type { LessonType } from "@/shared/types/sharedTypes";

export interface Language {
  id: number;
  name: string;
  isDefault: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Translation {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  language: Language;
  contactPersopnName: string;
  contactPersonPostion: string;
}
export type Content = {
  id: number;
  name: string;
  description: string;
  image: string;
  level: string;
  rate: number;
  whatToLearn: string;
  categoryId: number;
  categoryName: string;
};

export type ContentsResponse = {
  data: Content[];
};

export interface Institute {
  id: number;
  logo: string;
  image_profile: string;
  email: string;
  phone_key: string;
  phone: string;
  is_active: boolean;
  location: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  translations: Translation[];
  translation: Translation;
  region: {
    id: string;
    name: string;
    city: {
      id: string;
      name: string;
      country: {
        id: string;
        name: string;
      };
    };
  };
}
export type ContentDetailsResponse = {
  data: Content;
};
export type instituteResponse = {
  data: Institute;
};
export type InstitutesResponse = {
  data: Institute[];
};
export interface ProgramDetailsForAdmin {
  id: number;
  logo: string;
  name: string;
  description: string;
  languageId: number;
}
export type ProgramDetailsResponseForAdmin = {
  data: ProgramDetailsForAdmin;
};
export interface InstituteCourses {
  id: number;
  image: string;
  name: string;
  description: string;
  whatToLearn: string[];
}

export type User = {
  id: number;
  full_name: string;
  email: string;
  national_id: string;
  phone_key: string;
  phone: string;
  user_image: string;
  username: string;
  password: string;
  is_verified: number; // 0 | 1
  refreshToken: string | null;
  verified_method: number;
  is_active: number; // 0 | 1
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
  deletedAt: string | null;
  institute: Institute | null;
};
export type UserResponse = {
  data: User;
};
export type UsersResponse = {
  data: {
    users: User[];
  };
};
export type ProgramsForAdmin = {
  id: number;
  logo: string;
  name: string;
  description: string;
  languageId: number;
};
export type CoursesForDashboard = {
  id: number;
  image: string;
  name: string;
  description: string;
  whatToLearn: string[];
};
export type CourseDetailsResponseForDashboard = {
  data: CoursesForDashboard;
};
export type CoursesForDashboardResponse = {
  data: CoursesForDashboard[];
};

export type ProgramsResponseForAdmin = {
  data: {
    users: ProgramsForAdmin[];
  };
};
export type InstitutesCoursesResponse = {
  data: InstituteCourses[];
};

export type CountriesTypes = {
  id: number;
  name: string;
};
export type ProgramsInInstitute = {
  id: number;
  name: string;
  courses: {
    id: number;
    name: string;
  };
};
export type CountriesResponse = {
  data: CountriesTypes[];
};
export type CitiesResponse = {
  data: CountriesTypes[];
};
export type Languages = {
  id: number;
  name: string;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: number;
};
export type LanguagesResponse = {
  data: Languages[];
};
export type ProgramsInInstituteResponse = {
  data: ProgramsInInstitute[];
};
export type TopicsWithLessons = {
  id: number;
  name: string;
  duration: number;
  lessonsCount: number;
  lessons: LessonType[];
};
export type Topic = {
  name: string;
  description: string;
};
export type TopicResponse = {
  data: Topic;
};
export type TopicsResponse = {
  data: TopicsWithLessons[];
};

export type LearningPathType = {
  id: number;
  image: string;
  isActive: boolean;
  title: string;
  description: string;
  learning_outcoms: string;
};
export type ExpertTypeForDashboard = {
  id: number;
  title: string;
  bio: string;
  image: string;
  video_intro: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
};
export type ExpertDetailsResponse = {
  data: ExpertTypeForDashboard;
};

export type LearningPathsForDashboard = {
  data: LearningPathType[];
};
export type LearningPathsForDashboardResponse = {
  data: LearningPathType;
};
export type ExppertsForDashboardResponse = {
  data: { items: ExpertTypeForDashboard[] };
};
export type Categories = {
  id: number;
  name: string;
  description: string;
  is_active: number;
};
export type CategoriesResponse = {
  data: Categories[];
};
