import InnovaLogo from "@/assets/svgs/InnovaLogo.svg?react";
import { useLanguage } from "../localization/useLanguage";
const InnovaFooter = () => {
  const { t } = useLanguage();
  return (
    <footer className="text-[#E0DEDE] text-lg bg-[#016FA9] max-md:text-sm  text-center center items-center relative min-h-[60px]">
      <InnovaLogo className="h-[50px] max-sm:h-[30px] absolute max-sm:static left-20 max-md:left-0" />
      <div> {t("footer_by_company")} Innovadigit Solutions App </div>
    </footer>
  );
};

export default InnovaFooter;
