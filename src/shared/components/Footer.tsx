import { motion } from "framer-motion";
import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import { Link } from "react-router";
import { useLanguage } from "../localization/useLanguage";
import { lazy, Suspense } from "react";
const GooglePlay = lazy(() => import("@/assets/svgs/GooglePlay.svg?react"));
const AppleLogo = lazy(() => import("@/assets/svgs/AppleLogo.svg?react"));

const Footer = () => {
  const { t } = useLanguage();

  const footerLinks = {
    main: [
      { label: t("footer_about"), to: "#" },
      { label: t("footer_news"), to: "#" },
      { label: t("footer_team"), to: "#" },
      { label: t("footer_contact"), to: "#" },
    ],
    discover: [
      { label: t("footer_discover_courses"), to: "#" },
      { label: t("footer_discover_popular"), to: "#" },
      { label: t("footer_discover_plans"), to: "#" },
      { label: t("footer_discover_experts"), to: "#" },
    ],
    business: [{ label: t("footer_business_join_experts"), to: "#" }],
  };

  return (
    <motion.footer
      className="bg-primary py-8"
      aria-labelledby="footer-heading"
      dir="ltr"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          {/* Logo + Main Links */}
          <motion.div
            className="space-y-6 mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <LogoSm
              aria-label={t("footer_logo_alt")}
              className="mx-auto md:mx-0"
            />
            <ul role="list" className="space-y-3">
              {footerLinks.main.map((item, i) => (
                <motion.li key={i} whileHover={{ scale: 1.05 }}>
                  <Link
                    to={item.to}
                    className="text-sm text-[#575757] hover:text-secondary transition block"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Discover & Business */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Discover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {t("footer_discover_title")}
              </h3>
              <ul role="list" className="mt-5 space-y-3">
                {footerLinks.discover.map((item, i) => (
                  <motion.li key={i} whileHover={{ scale: 1.05 }}>
                    <Link
                      to={item.to}
                      className="text-sm text-[#575757] hover:text-secondary transition block"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Business */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className=" text-center"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {t("footer_business_title")}
              </h3>
              <ul role="list" className="mt-5 space-y-3">
                {footerLinks.business.map((item, i) => (
                  <motion.li key={i} whileHover={{ scale: 1.05 }}>
                    <Link
                      to={item.to}
                      className="text-sm text-[#575757] hover:text-secondary transition block"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
                <motion.li whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/"
                    className="border rounded-xl text-secondary border-secondary px-6 py-1.5 inline-block mt-2"
                  >
                    {t("join_now")}
                  </Link>
                </motion.li>
              </ul>
            </motion.div>
          </div>

          {/* App Download */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              {t("footer_download_title")}
            </h3>
            <ul role="list" className="mt-5 space-y-4 max-w-45 mx-auto">
              <motion.li whileHover={{ scale: 1.05 }}>
                <Link
                  to="/"
                  className="border rounded-xl text-sm bg-white text-secondary border-secondary px-7 py-0.5 flex justify-center"
                >
                  <div className="flex justify-between items-center gap-3">
                    <Suspense
                      fallback={
                        <span className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
                      }
                    >
                      <GooglePlay />
                    </Suspense>
                    <div>
                      <span className="block text-[12px]">Get it on</span>
                      <span>Google Play</span>
                    </div>
                  </div>
                </Link>
              </motion.li>
              <motion.li whileHover={{ scale: 1.05 }}>
                <Link
                  to="/"
                  className="border flex justify-center rounded-xl text-sm bg-white text-secondary border-secondary px-7 py-0.5"
                >
                  <div className="flex justify-between items-center gap-3">
                    <Suspense
                      fallback={
                        <span className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
                      }
                    >
                      <AppleLogo />
                    </Suspense>
                    <div>
                      <span className="block text-[12px]">Download on the</span>
                      <span>App Store</span>
                    </div>
                  </div>
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
