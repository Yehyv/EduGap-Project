import HIMSLogo from "@/assets/imgs/ForDev/HIMSLogo.png";
import { useLanguage } from "../localization/useLanguage";
const InstituteHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="p-4 bg-gradient-to-r from-header-gradient-start to-header-gradient-end">
      <div className="relative container">
        <img
          src={HIMSLogo}
          className="w-16 absolute left-4 top-1/2 -translate-y-1/2 max-sm:w-10"
        ></img>
        <h4 className="text-center text-[18px] max-md:text-sm max-w-42 mx-auto">
          {t("institute_title")}
        </h4>
      </div>
    </div>
  );
};

export default InstituteHeader;
