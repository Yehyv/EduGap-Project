import { useState } from "react";
import translations from "./translations";
import type { Language, TranslationKeys } from "./LanguageContext";
import { LanguageContext } from "./LanguageContext";

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lang, setLang] = useState<Language>("en");

  const t = (key: TranslationKeys) => translations[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
