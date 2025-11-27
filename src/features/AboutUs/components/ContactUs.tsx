import InternetIcon from "@/assets/svgs/InterNetIconWhite.svg?react";
import EmailIcon from "@/assets/svgs/EmailIcon.svg?react";
import { Link } from "react-router-dom";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import { motion } from "framer-motion";
import { useLanguage } from "@/shared/localization/useLanguage";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ContactUs = () => {
  const { t } = useLanguage();

  return (
    <>
      <ScrollToTop />
      <div className="bg-[#2B2B2B] py-30">
        <div className="container">
          {/* Header */}
          <motion.div
            className="text-center mb-20 text-white"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h6 className="font-semibold mb-2 text-2xl">
              {t("contact_us_title")}
            </h6>
            <p>{t("contact_us_subtitle")}</p>
          </motion.div>

          {/* Cards */}
          <div className="grid max-md:grid-cols-1 grid-cols-2 gap-5 lg:mx-30">
            {/* Email Card */}
            <motion.div
              className="flex bg-[#424242] rounded-xl p-5 gap-5"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div>
                <div className="bg-secondary p-2 rounded-xl w-fit">
                  <EmailIcon className="w-10 h-10" />
                </div>
              </div>
              <div>
                <h5 className="text-white">{t("contact_email_title")}</h5>

                <Link to={""} className="text-[#E68C3A]">
                  {t("contact_email_address")}
                </Link>

                <p className="text-[#D6D6D6]">{t("contact_email_desc")}</p>
              </div>
            </motion.div>

            {/* Website Card */}
            <motion.div
              className="flex bg-[#424242] rounded-xl p-5 gap-5"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div>
                <div className="bg-secondary p-2 rounded-xl w-fit">
                  <InternetIcon className="w-10 h-10" />
                </div>
              </div>
              <div>
                <h5 className="text-white">{t("contact_website_title")}</h5>

                <Link to={""} className="text-[#E68C3A]">
                  {t("contact_website_link")}
                </Link>

                <p className="text-[#D6D6D6]">{t("contact_website_desc")}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
