import { motion } from "framer-motion";
import { Users, TrendingUp, Globe2, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/shared/localization/useLanguage";

// Static config outside component — icons and styles never change between languages
const CARDS_CONFIG = [
  {
    id: "expand_your_reach",
    icon: Users,
    titleKey: "expand_your_reach",
    descKey: "expand_your_reach_desc",
    accent: "from-blue-500/10 to-blue-600/5",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-200",
  },
  {
    id: "increase_enrollment",
    icon: TrendingUp,
    titleKey: "increase_enrollment",
    descKey: "increase_enrollment_desc",
    accent: "from-blue-500/10 to-blue-600/5",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-200",
  },
  {
    id: "global_visibility",
    icon: Globe2,
    titleKey: "global_visibility",
    descKey: "global_visibility_desc",
    accent: "from-blue-500/10 to-blue-600/5",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-200",
  },
  {
    id: "quality_recognition",
    icon: BadgeCheck,
    titleKey: "quality_recognition",
    descKey: "quality_recognition_desc",
    accent: "from-blue-500/10 to-blue-600/5",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-200",
  },
];

// Also move variants outside — no need to recreate them on every render
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const WhyEduGap = () => {
  const { t } = useLanguage();

  return (
    <section className="py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            {t("why_partner_with_edugap")}
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            {t("join_existing_institutes")}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {CARDS_CONFIG.map(
            ({
              id,
              icon: Icon,
              titleKey,
              descKey,
              accent,
              iconBg,
              iconColor,
              borderHover,
            }) => (
              <motion.div
                key={id}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className={`
                group relative bg-white rounded-2xl border border-gray-200
                ${borderHover} hover:shadow-lg hover:shadow-gray-100/80
                transition-all duration-300 overflow-hidden p-6 flex flex-col gap-4
              `}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div
                  className={`relative w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <Icon
                    className={`w-5 h-5 ${iconColor} transition-transform duration-300 group-hover:scale-110`}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="relative flex flex-col gap-1.5">
                  <h5 className="font-semibold text-gray-800 text-base leading-snug">
                    {t(titleKey)}
                  </h5>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {t(descKey)}
                  </p>
                </div>

                <div
                  className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r ${accent.replace("/10", "").replace("/5", "")}`}
                />
              </motion.div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyEduGap;
