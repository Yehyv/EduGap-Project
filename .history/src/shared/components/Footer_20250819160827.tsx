import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import { Link } from "react-router";

const footerLinks = {
  main: [
    { label: "عن المنصة", to: "#" },
    { label: "اخبارنا", to: "#" },
    { label: "الفريق", to: "#" },
    { label: "اتصل بنا", to: "#" },
  ],
  discover: [
    { label: "دوراتنا التدريبية", to: "#" },
    { label: "الدورات الاكثر شيوعا", to: "#" },
    { label: "انظمة الاشتراك", to: "#" },
    { label: "خبراء المنصة", to: "#" },
  ],
  business: [{ label: "انضم لخبراء المنصة", to: "#" }],
};

const Footer = () => {
  return (
    <footer
      className="tw-bg-white tw-py-8"
      aria-labelledby="footer-heading"
      dir="ltr"
    >
      <div className="tw-container tw-mx-auto tw-max-w-7xl tw-px-4">
        <div className="xl:tw-grid xl:tw-grid-cols-3 xl:tw-gap-16">
          {/* Logo + Main Links */}
          <div className="tw-space-y-6">
            <LogoSm aria-label="شعار المنصة" />
            <ul role="list" className="tw-space-y-3">
              {footerLinks.main.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="tw-text-sm tw-text-gray-700 hover:tw-text-primary tw-transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover & Business */}
          <div className="tw-grid tw-grid-cols-1 tw-gap-10 xl:tw-col-span-2 xl:tw-mt-0">
            <div className="md:tw-grid md:tw-grid-cols-2 md:tw-gap-10">
              {/* Discover */}
              <div>
                <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900">
                  اكتشف المزيد
                </h3>
                <ul role="list" className="tw-mt-5 tw-space-y-3">
                  {footerLinks.discover.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        className="tw-text-sm tw-text-gray-700 hover:tw-text-primary tw-transition"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business */}
              <div>
                <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900">
                  المنصة للأعمال
                </h3>
                <ul role="list" className="tw-mt-5 tw-space-y-3">
                  {footerLinks.business.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        className="tw-text-sm tw-text-gray-700 hover:tw-text-primary tw-transition"
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
