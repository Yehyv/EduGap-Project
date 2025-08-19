import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import { Link } from "react-router";
const Footer = () => {
  return (
    <footer
      className="bg-white py-6"
      aria-labelledby="footer-heading"
      dir="ltr"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="xl:grid xl:grid-cols-3 xl:gap-20">
          <div className="space-y-5">
            <LogoSm className="mx-auto" />
            <div className="grid grid-cols-1 gap-8  xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-1 md:gap-8">
                <div>
                  <ul role="list" className="space-y-4">
                    <li>
                      <Link to="#" className="text-sm leading-6">
                        عن المنصة
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="text-sm leading-6">
                        اخبارنا
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="text-sm leading-6">
                        الفريق
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="text-sm leading-6">
                        اتصل بنا
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 xl:col-span-2 xl:mt-0 pt-3">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  اكتشف المزيد
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link to="#" className="text-sm leading-6">
                      دوراتنا التدريبية
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-sm leading-6">
                      الدورات الاكثر شيوعا
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-sm leading-6">
                      انظمة الاشتراك
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-sm leading-6">
                      خبراء المنصة
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  المنصة للأعمال
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link to="#" className="text-sm leading-6">
                      انضم لخبراء المنصة
                    </Link>
                  </li>
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
