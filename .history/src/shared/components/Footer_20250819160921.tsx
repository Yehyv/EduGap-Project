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
      className="bg-white py-8"
      aria-labelledby="footer-heading"
      dir="ltr"
    >
      <div className="container mx-auto max-w-7xl px-4">
        <div className="xl:grid xl:grid-cols-3 xl:gap-16">
          {/* Logo + Main Links */}
          <div className="space-y-6">
            <LogoSm aria-label="شعار المنصة" />
            <ul role="list" className="space-y-3">
              {footerLinks.main.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="text-sm text-gray-700 hover:text-primary transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover & Business */}
          <div className="grid grid-cols-1 gap-10 xl:col-span-2 xl:mt-0 mt-20">
            <div className="md:grid md:grid-cols-2 md:gap-10">
              {/* Discover */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  اكتشف المزيد
                </h3>
                <ul role="list" className="mt-5 space-y-3">
                  {footerLinks.discover.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        className="text-sm text-gray-700 hover:text-primary transition"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  المنصة للأعمال
                </h3>
                <ul role="list" className="mt-5 space-y-3">
                  {footerLinks.business.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        className="text-sm text-gray-700 hover:text-primary transition"
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
