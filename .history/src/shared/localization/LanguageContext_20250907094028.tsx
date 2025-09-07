import { createContext, useState } from "react";
import translations from "./translations";

type Language = keyof typeof translations;
type TranslationKeys = keyof (typeof translations)["en"];

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
