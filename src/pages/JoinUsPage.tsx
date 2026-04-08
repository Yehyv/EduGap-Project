import Logo from "@/assets/imgs/LogoImage.png";
import HowItWorks from "@/features/AboutUs/components/HowItWorks";
import WhyEduGap from "@/features/AboutUs/components/WhyEduGap";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/shared/localization/useLanguage";
import ApplyJoinUs from "@/features/AboutUs/components/ApplyJoinUs";
import ScrollToTop from "@/shared/utils/ScrollToTop";

const JoinUsPage = () => {
  const { t, lang } = useLanguage();

  return (
    <>
      <ScrollToTop />
      <div className="bg-gradient-to-b from-[#D7F1FF] to-white">
        <div className="flex flex-col items-center gap-3 mt-10">
          <img src={Logo} alt="EduGap" width={150} />

          <h1 className="mt-4 text-[#113853]">
            {t("become_partner_institute")}
          </h1>

          <p className="text-[#575757]">{t("join_description")}</p>

          <button className="bg-secondary px-8 py-2 text-white rounded-lg text-lg mt-6">
            <span>{t("apply_now")}</span>
            <ArrowRight
              className={`${lang == "ar" ? "rotate-180" : ""} inline-block ms-1`}
            />
          </button>
        </div>

        <WhyEduGap />
      </div>

      <HowItWorks />
      <ApplyJoinUs />
    </>
  );
};

export default JoinUsPage;
