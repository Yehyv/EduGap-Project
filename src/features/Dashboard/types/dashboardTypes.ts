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

export type InstitutesResponse = {
  data: Institute[];
};
