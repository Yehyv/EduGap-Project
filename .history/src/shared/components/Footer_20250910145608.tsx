import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import { Link } from "react-router";
import { useLanguage } from "../localization/useLanguage";

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
    <footer
      className="bg-primary py-8"
      aria-labelledby="footer-heading"
      dir="ltr"
    >
      <div className="container mx-auto max-w-7xl text-center">
        <div className="xl:grid xl:grid-cols-3">
          {/* Logo + Main Links */}
          <div className="space-y-6 min-xl:w-20">
            <LogoSm aria-label="شعار المنصة" className="mx-auto" />
            <ul role="list" className="space-y-3">
              {footerLinks.main.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="text-sm transition text-[#575757]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover & Business */}
          <div className="grid grid-cols-1 gap-10 xl:col-span-2 xl:mt-0 pt-4">
            <div className="md:grid md:grid-cols-2 md:gap-10">
              {/* Discover */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("footer_discover_title")}
                </h3>
                <ul role="list" className="mt-5 space-y-3">
                  {footerLinks.discover.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        className="text-sm transition text-[#575757]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business */}
              <div className="max-md:mt-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("footer_business_title")}
                </h3>
                <ul role="list" className="mt-5 space-y-3">
                  {footerLinks.business.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        className="text-sm transition text-[#575757]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
