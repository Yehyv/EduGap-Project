export type TabType = "information" | "courses" | "institutes";

export interface Translation {
  name: string;
  description: string;
}

export interface ProgramData {
  id: string;
  logo: string;
  is_active: boolean;
  createdAt?: string;
  createdBy?: {
    full_name: string;
  };
  translations: Translation[];
}

export interface CourseInProgram {
  id: string;
  name: string;
}

export interface Institute {
  instituteId: number;
  logo: string;
  name: string;
  coursesCount: number;
  studentsCount: number;
}
