import HIMSLogo from "@/assets/imgs/ForDev/HIMSLogo.png";
import { useLanguage } from "../localization/useLanguage";
const InstituteHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="p-4 bg-gradient-to-r from-header-gradient-start to-header-gradient-end">
      <div className="relative container">
        <img
          src={HIMSLogo}
          className="w-18 absolute start-4 top-1/2 -translate-y-1/2 "
        ></img>
        <h4 className="text-center text-[18px] max-md:text-sm">
          {t("institute_title")}
        </h4>
      </div>
    </div>
  );
};

export default InstituteHeader;
