import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../localization/useLanguage";

const InnovaLogo = lazy(() => import("@/assets/svgs/InnovaLogo.svg?react"));
const TwitterIcon = lazy(() => import("@/assets/svgs/twitter.svg?react"));
const LinkedinIcon = lazy(() => import("@/assets/svgs/linkedin.svg?react"));
const YoutupeIcon = lazy(() => import("@/assets/svgs/youtube.svg?react"));
const InstagramIcon = lazy(() => import("@/assets/svgs/instagram.svg?react"));
const FacebookIcon = lazy(() => import("@/assets/svgs/facebook.svg?react"));

const InnovaFooter = () => {
  const { t } = useLanguage();

  return (
    <>
      {/* Top Footer */}
      <div
        dir="rtl"
        className="bg-[#E7EDFF] text-secondary text-lg py-3 max-md:text-sm flex flex-col md:flex-row items-center justify-between px-6 md:px-10 gap-4 md:gap-0"
      >
        {/* Right – Email or Logo */}
        <div className="flex items-center justify-end md:flex-1 md:justify-end mt-2 md:mt-0"></div>

        {/* Center Text */}
        <div className="text-center flex flex-col md:flex-row items-center gap-2 md:gap-4 text-black flex-1 justify-center">
          <span className="cursor-pointer hover:text-secondary transition">
            {t("privacy_policy")}
          </span>
          <span className="cursor-pointer hover:text-secondary transition">
            {t("terms_of_use")}
          </span>
          <span className="text-secondary cursor-default">
            {t("footer_email")}
          </span>
        </div>

        {/* Left – Social Icons */}
        <div className="flex items-center gap-3 md:flex-1 md:justify-end">
          <Suspense
            fallback={
              <span className="w-6 h-6 bg-gray-300 animate-pulse rounded"></span>
            }
          >
            {[
              TwitterIcon,
              LinkedinIcon,
              YoutupeIcon,
              InstagramIcon,
              FacebookIcon,
            ].map((Icon, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.15 }}>
                <Icon className="cursor-pointer w-5 h-5" />
              </motion.div>
            ))}
          </Suspense>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer
        dir="rtl"
        className="bg-primary text-secondary text-lg max-md:text-sm py-0 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0"
      >
        {/* Left Empty */}
        <div className="flex-1"></div>

        {/* Center Text */}
        <div className="text-center flex-1">
          {t("footer_by_company")} Innovadigit Solutions App
        </div>

        {/* Right Logo */}
        <div className="flex-1 flex justify-end">
          <Suspense
            fallback={
              <span className="w-6 h-6 bg-gray-300 animate-pulse rounded"></span>
            }
          >
            <InnovaLogo />
          </Suspense>
        </div>
      </footer>
    </>
  );
};

export default InnovaFooter;
