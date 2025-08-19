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
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <LogoSm />
            <p className="text-sm leading-6 text-gray-600">
              Making football look better to the world and a more respecful
              game.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">
                  اكتشف المزيد
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      دوراتنا التدريبية
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      الدورات الاكثر شيوعا
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      انظمة الاشتراك
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      خبراء المنصة
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-lg font-bold leading-6 text-gray-900">
                  المنصة للأعمال
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
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
