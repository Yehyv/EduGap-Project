import React, { createContext, useContext, useState, ReactNode } from "react";
import translations from "./translations";

type Language = keyof typeof translations; // "en" | "ar"
type TranslationKeys = keyof (typeof translations)["en"]; // "hello" | "welcome"

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("en");

  const t = (key: TranslationKeys) => {
    return translations[lang][key];
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
