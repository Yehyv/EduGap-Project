import OurServicesIcon from "@/assets/svgs/OurServicesIcon.svg?react";
import TrendIcon from "@/assets/svgs/TrendIcon.svg?react";
import ComputerIcon from "@/assets/svgs/ComputerIconWhite.svg?react";
import BuildingIcon from "@/assets/svgs/ComputerIconWhite.svg?react";
import CertificateIcon from "@/assets/svgs/CertificateIconWhite.svg?react";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import { useLanguage } from "@/shared/localization/useLanguage";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerParent = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardAnim = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const OurServices = () => {
  const { t } = useLanguage();

  return (
    <>
      <ScrollToTop />
      <div className="bg-white">
        <div className="container">
          {/* Section Title */}
          <motion.h5
            className="bg-[#FFF2DA] center gap-2 w-fit px-10 py-1 rounded-2xl mx-auto text-[#E68C3A] mt-10 text-lg"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <OurServicesIcon />
            <span>{t("our_services")}</span>
          </motion.h5>

          {/* Headline */}
          <motion.div
            className="text-center py-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h6 className="text-secondary font-semibold mb-2">
              {t("what_we_offer")}
            </h6>
            <p>{t("services_description")}</p>
          </motion.div>

          {/* Cards */}
          <motion.div
            className="grid max-md:grid-cols-1 max-xl:grid-cols-2 grid-cols-4 gap-5 py-10 mb-10"
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Card 1 */}
            <motion.div
              className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              variants={cardAnim}
            >
              <div className="bg-secondary p-2 rounded-xl w-fit">
                <ComputerIcon />
              </div>
              <h6 className="font-semibold py-2">{t("diverse_courses")}</h6>
              <p className="text-[#4F4F4F]">{t("diverse_courses_desc")}</p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              variants={cardAnim}
            >
              <div className="bg-[#E68C3A] p-2 rounded-xl w-fit">
                <TrendIcon />
              </div>
              <h6 className="font-semibold py-2">{t("learning_paths")}</h6>
              <p className="text-[#4F4F4F]">{t("learning_paths_desc")}</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              variants={cardAnim}
            >
              <div className="bg-[#E68C3A] p-2 rounded-xl w-fit">
                <BuildingIcon />
              </div>
              <h6 className="font-semibold py-2">
                {t("institute_subscriptions")}
              </h6>
              <p className="text-[#4F4F4F]">
                {t("institute_subscriptions_desc")}
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              className="bg-[#F8FDFF] p-5 rounded-xl shadow-custom hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              variants={cardAnim}
            >
              <div className="bg-[#E68C3A] p-2 rounded-xl w-fit">
                <CertificateIcon />
              </div>
              <h6 className="font-semibold py-2">
                {t("digital_certificates")}
              </h6>
              <p className="text-[#4F4F4F]">{t("digital_certificates_desc")}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OurServices;
