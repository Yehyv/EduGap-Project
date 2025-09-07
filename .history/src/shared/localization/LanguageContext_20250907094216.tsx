import { createContext } from "react";
import translations from "./translations";

export type Language = keyof typeof translations;
export type TranslationKeys = keyof (typeof translations)["en"];

export type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);
