import { useState, useEffect } from "react";
import translations from "./translations";
import { LanguageContext } from "./LanguageContext";
import type { Language, TranslationKeys } from "./LanguageContext";

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("lang") as Language | null;
    if (saved) return saved;
    if (navigator.language.startsWith("ar")) return "ar";
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.body.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.lang = lang;
  }, [lang]);

  const t = (key: TranslationKeys) => translations[lang][key];

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
