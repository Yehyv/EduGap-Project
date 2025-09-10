import InnovaLogo from "@/assets/svgs/InnovaLogo.svg?react";
import { useLanguage } from "../localization/useLanguage";
const InnovaFooter = () => {
  const { t } = useLanguage();
  return (
    <footer className="text-[#E0DEDE] text-lg bg-[#016FA9] max-md:text-sm  text-center center items-center relative min-h-[60px]">
      <div> {t("footer_by")} Innovadigit Solutions App </div>
      <InnovaLogo className="h-[50px] absolute left-20 max-md:left-0" />
    </footer>
  );
};

export default InnovaFooter;
