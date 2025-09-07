import { useEffect } from "react";
import { useLanguage } from "../localization/useLanguage";

const HtmlDirection = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useLanguage();

  useEffect(() => {
    document.body.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.lang = lang;
  }, [lang]);

  return <>{children}</>;
};

export default HtmlDirection;
