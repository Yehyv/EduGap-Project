import DefaultButton from "@/shared/components/ui/DefaultButton";
import HeroSectionImage from "@/assets/imgs/HeroSectionImage.png";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const textVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const buttonVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, delay: 0.4, ease: "easeOut" },
  },
};

const imageVariant = {
  hidden: { opacity: 0, x: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
  },
};

const HeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="bg-primary">
      <div className="container flex flex-col-reverse md:flex-row pt-10 max-xl:pb-10 justify-between items-center md:items-start">
        {/* Text Section */}
        <motion.div
          className="w-full md:max-w-[680px] text-center md:text-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h1
            className="text-text-first text-2xl md:text-2xl font-second font-medium leading-snug pt-6 pb-3"
            variants={textVariant}
          >
            {t("hero_title")}
          </motion.h1>

          <motion.p
            className="text-text-second font-second font-semibold text-base md:text-lg"
            variants={textVariant}
          >
            {t("hero_subtitle")}
          </motion.p>

          <motion.div
            className="center text-center md:text-start"
            variants={buttonVariant}
          >
            <DefaultButton
              onClick={() => navigate("/login")}
              text={t("subscribe")}
              type="button"
              moreStyle="px-12 md:px-16 text-lg md:text-xl mt-10 md:mt-16 !shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
            />
          </motion.div>
        </motion.div>

        {/* Image Section */}
        <motion.div
          className="w-full md:w-[30%] mt-8 md:mt-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={imageVariant}
        >
          <img
            className="mx-auto md:ms-auto w-2/3 md:w-full"
            src={HeroSectionImage}
            alt="Hero"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
