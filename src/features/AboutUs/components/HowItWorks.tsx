import { motion } from "framer-motion";
import { ClipboardList, ShieldCheck, Rocket } from "lucide-react";
import { useLanguage } from "@/shared/localization/useLanguage";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: "easeOut" },
  },
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, delay: 0.5, ease: "easeOut" },
  },
};

// Static config — icons, keys, styles only. NO t() calls here.
// This lives outside the component so it's never recreated on re-render.
const STEPS_CONFIG = [
  {
    id: "submit_application",
    number: "01",
    icon: ClipboardList,
    titleKey: "submit_application",
    descKey: "submit_application_desc",
    iconBg: "bg-secondary",
    iconColor: "text-white",
    ringColor: "ring-blue-100",
    numberColor: "text-blue-400",
  },
  {
    id: "review_verification",
    number: "02",
    icon: ShieldCheck,
    titleKey: "review_verification",
    descKey: "review_verification_desc",
    iconBg: "bg-secondary",
    iconColor: "text-white",
    ringColor: "ring-blue-100",
    numberColor: "text-blue-400",
  },
  {
    id: "start_growing",
    number: "03",
    icon: Rocket,
    titleKey: "start_growing",
    descKey: "start_growing_desc",
    iconBg: "bg-secondary",
    iconColor: "text-white",
    ringColor: "ring-blue-100",
    numberColor: "text-blue-400",
  },
];

const HowItWorks = () => {
  const { t } = useLanguage();

  return (
    <section className="py-10 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-secondary/70 bg-secondary/8 border border-secondary/15 rounded-full px-4 py-1.5 mb-4">
            {t("getting_started")}
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            {t("how_it")} <span className="text-secondary">{t("works")}</span>
          </h2>

          <p className="text-gray-500 text-base max-w-md leading-relaxed">
            {t("how_it_works_description")}
          </p>
        </motion.div>

        <motion.div
          className="relative grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-60px" }}
        >
          <motion.div
            className="hidden md:block absolute top-[84px] left-[calc(33.33%+4px)] right-[calc(33.33%+4px)] h-px origin-left z-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, #bfdbfe, #ddd6fe, #a7f3d0)",
            }}
            variants={lineVariants}
          />

          {STEPS_CONFIG.map(
            ({
              id,
              number,
              icon: Icon,
              titleKey,
              descKey,
              iconBg,
              iconColor,
              ringColor,
              numberColor,
            }) => (
              <motion.div
                key={id}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative z-10 bg-gray-50 border border-gray-100 rounded-2xl px-6 pt-6 pb-7 flex flex-col items-center text-center hover:shadow-md hover:border-gray-200 transition-all duration-300 overflow-hidden"
              >
                <span
                  className={`absolute top-3 right-4 text-6xl font-black ${numberColor} opacity-[0.12] leading-none select-none pointer-events-none`}
                >
                  {number}
                </span>

                <div className="relative mb-5 mt-1">
                  <div
                    className={`w-16 h-16 rounded-full ${iconBg} ring-4 ${ringColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon
                      className={`w-7 h-7 ${iconColor}`}
                      strokeWidth={1.6}
                    />
                  </div>
                </div>

                <h5 className="font-semibold text-gray-800 text-base mb-2 relative z-10">
                  {t(titleKey)}
                </h5>

                <p className="text-gray-500 text-sm leading-relaxed relative z-10">
                  {t(descKey)}
                </p>
              </motion.div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
