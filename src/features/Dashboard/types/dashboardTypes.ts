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
}

export interface Institute {
  id: number;
  logo: string;
  image_profile: string;
  email: string;
  phone_key: string;
  phone: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  translations: Translation[];
  translation: Translation;
}
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
export type InstitutesCoursesResponse = {
  data: InstituteCourses[];
};
