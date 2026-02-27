import AnimatedNumber from "@/pages/dashboard/AnimatedNumber";
import { motion } from "framer-motion";
interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  subLabel?: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
  icon: React.ReactNode;
}
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};
const StatCard = ({
  title,
  value,
  suffix = "%",
  subLabel,
  borderColor,
  textColor,
  bgColor,
  icon,
}: StatCardProps) => (
  <motion.div
    variants={cardVariants}
    whileHover={{
      y: -4,
      boxShadow: "0 10px 28px rgba(0,0,0,0.10)",
      transition: { type: "spring", stiffness: 320, damping: 22 },
    }}
    className={`flex justify-between p-3 bg-white shadow-custom rounded-xl border-l-4 ${borderColor}`}
  >
    <div>
      <h4 className="text-gray-400 text-sm sm:text-base">{title}</h4>
      <AnimatedNumber
        value={value}
        suffix={suffix}
        className={`${textColor} text-xl sm:text-2xl font-bold tabular-nums block`}
      />
      {subLabel && (
        <span className="text-gray-400 text-xs sm:text-sm">{subLabel}</span>
      )}
    </div>

    <motion.div
      whileHover={{ rotate: 12, scale: 1.15 }}
      transition={{ type: "spring", stiffness: 400, damping: 14 }}
      className={`w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center ${bgColor} rounded-full p-1.5`}
    >
      {icon}
    </motion.div>
  </motion.div>
);

export default StatCard;
