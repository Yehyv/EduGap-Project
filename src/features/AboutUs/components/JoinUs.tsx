import BuildingIcon from "@/assets/svgs/BuildingIcon.svg?react";
import LearningIcon from "@/assets/svgs/LearningIcon.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const JoinUs = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <>
      <div className="container">
        {/* Title Section */}
        <motion.div
          className="text-center py-10 text-white"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h6 className="font-semibold mb-2 text-lg">
            {t("join_edugap_today")}
          </h6>

          <p className="lg:px-36">{t("join_edugap_description")}</p>
        </motion.div>

        {/* Cards */}
        <div className="grid max-md:grid-cols-1 grid-cols-2 gap-10 py-10 mb-10 lg:mx-30">
          {/* Students Card */}
          <motion.div
            className="bg-white p-5 rounded-xl flex flex-col justify-between shadow-md"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="bg-secondary p-2 rounded-xl w-fit">
              <LearningIcon />
            </div>

            <h6 className="font-semibold py-2">{t("for_students")}</h6>

            <p className="text-[#4F4F4F]">{t("for_students_desc")}</p>

            <motion.button
              onClick={() => {
                navigate("/login");
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-secondary text-white w-full py-1.5 rounded-xl mt-5 cursor-pointer"
            >
              {t("start_learning")}
            </motion.button>
          </motion.div>

          {/* Institutes Card */}
          <motion.div
            className="bg-white p-5 rounded-xl flex flex-col justify-between shadow-md"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="bg-[#E68C3A] p-2 rounded-xl w-fit">
              <BuildingIcon />
            </div>

            <h6 className="font-semibold py-2">{t("for_institutes")}</h6>

            <p className="text-[#4F4F4F]">{t("for_institutes_desc")}</p>

            <motion.button
              onClick={() => {
                navigate("#");
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-[#E68C3A] text-white w-full py-1.5 rounded-xl mt-5 cursor-pointer"
            >
              {t("join_us")}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default JoinUs;
