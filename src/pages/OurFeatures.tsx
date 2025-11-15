import TrendIcon from "@/assets/svgs/TrendIcon.svg?react";
import CertificateIcon from "@/assets/svgs/CertificateIconWhite.svg?react";
import FeaturesIcon from "@/assets/svgs/FeaturesIcon.svg?react";
import PeopleIcon from "@/assets/svgs/PeopleIcon.svg?react";
import InternetIcon from "@/assets/svgs/InterNetIconWhite.svg?react";
import ShieldIcon from "@/assets/svgs/ShieldIcon.svg?react";
import ProtectionIcon from "@/assets/svgs/ProtectionIcon.svg?react";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import { useLanguage } from "@/shared/localization/useLanguage";

const OurFeatures = () => {
  const { t } = useLanguage();

  return (
    <>
      <ScrollToTop />
      <div className="bg-white">
        <div className="container">
          <h5 className="bg-[#D8F0FD] center gap-2 w-fit px-10 py-1 rounded-2xl mx-auto text-secondary mt-10 text-lg">
            <FeaturesIcon />
            <span>{t("platform_features")}</span>
          </h5>

          <div className="text-center py-10">
            <h6 className="text-secondary font-semibold mb-2">
              {t("why_choose_edugap")}
            </h6>
            <p>{t("why_choose_edugap_desc")}</p>
          </div>

          <div className="grid max-md:grid-cols-1 max-xl:grid-cols-2 grid-cols-3 gap-5 py-10 mb-10">
            <div className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom flex items-center justify-between flex-col ">
              <div className="bg-secondary p-2 rounded-xl w-fit">
                <InternetIcon className="w-10 h-10" />
              </div>
              <h6 className="font-semibold py-2">
                {t("multi_language_support")}
              </h6>
              <p className="text-[#4F4F4F]">
                {t("multi_language_support_desc")}
              </p>
            </div>

            <div className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom flex items-center justify-between flex-col ">
              <div className="bg-secondary p-2 rounded-xl w-fit">
                <PeopleIcon className="w-10 h-10" />
              </div>
              <h6 className="font-semibold py-2">{t("easy_navigation")}</h6>
              <p className="text-[#4F4F4F]">{t("easy_navigation_desc")}</p>
            </div>

            <div className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom flex items-center justify-between flex-col ">
              <div className="bg-[#E68C3A] p-2 rounded-xl w-fit">
                <CertificateIcon className="w-10 h-10" />
              </div>
              <h6 className="font-semibold py-2">
                {t("certificate_printing")}
              </h6>
              <p className="text-[#4F4F4F]">{t("certificate_printing_desc")}</p>
            </div>

            <div className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom flex items-center justify-between flex-col ">
              <div className="bg-secondary p-2 rounded-xl w-fit">
                <ShieldIcon className="w-10 h-10" />
              </div>
              <h6 className="font-semibold py-2">{t("secure_verified")}</h6>
              <p className="text-[#4F4F4F]">{t("secure_verified_desc")}</p>
            </div>

            <div className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom flex items-center justify-between flex-col ">
              <div className="bg-[#E68C3A] p-2 rounded-xl w-fit">
                <TrendIcon className="w-10 h-10" />
              </div>
              <h6 className="font-semibold py-2">{t("progress_tracking")}</h6>
              <p className="text-[#4F4F4F]">{t("progress_tracking_desc")}</p>
            </div>

            <div className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom flex items-center justify-between flex-col ">
              <div className="bg-[#E68C3A] p-2 rounded-xl w-fit">
                <ProtectionIcon className="w-10 h-10" />
              </div>
              <h6 className="font-semibold py-2">{t("accredited_content")}</h6>
              <p className="text-[#4F4F4F]">{t("accredited_content_desc")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OurFeatures;
