import LogoSm from "@/assets/svgs/LogoSm.svg?react";
const Footer = () => {
  return (
    <footer
      className="bg-white py-4"
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
                  Solutions
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      Marketing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      Analytics
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      Commerce
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      Insights
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">
                  Support
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      Guides
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      API Status
                    </a>
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
