import ShiningIcon from "@/assets/svgs/ShiningIcon.svg?react";
import OurVissionIcon from "@/assets/svgs/OurVissionIcon.svg?react";
import BookIcon from "@/assets/svgs/bookIcon.svg?react";
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
    transition: { staggerChildren: 0.2 },
  },
};

const cardAnim = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AboutUs = () => {
  const { t } = useLanguage();

  return (
    <>
      <ScrollToTop />
      <div className="bg-primary">
        <div className="container">
          {/* Section Title */}
          <motion.h5
            className="bg-[#D8F0FD] center gap-2 w-fit px-10 py-1 rounded-2xl mx-auto text-secondary mt-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <ShiningIcon />
            <span>{t("about_edugap")}</span>
          </motion.h5>

          {/* Description */}
          <motion.div
            className="text-center py-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h6 className="text-secondary font-semibold mb-2">
              {t("empowering_education")}
            </h6>
            <p>{t("about_description")}</p>
          </motion.div>

          {/* Vision & Mission Cards */}
          <motion.div
            className="grid max-md:grid-cols-1 grid-cols-2 gap-5 py-10 mb-10"
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-white p-5 rounded-xl shadow-custom hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              variants={cardAnim}
            >
              <div className="bg-secondary p-2 rounded-xl w-fit">
                <OurVissionIcon />
              </div>
              <h6 className="font-semibold py-2">{t("our_vision")}</h6>
              <p className="text-[#4F4F4F]">{t("our_vision_desc")}</p>
            </motion.div>

            <motion.div
              className="bg-white p-5 rounded-xl shadow-custom hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              variants={cardAnim}
            >
              <div className="bg-[#E68C3A] p-2 rounded-xl w-fit">
                <BookIcon />
              </div>
              <h6 className="font-semibold py-2">{t("our_mission")}</h6>
              <p className="text-[#4F4F4F]">{t("our_mission_desc")}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
