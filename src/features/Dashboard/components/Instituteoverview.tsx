import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  MonitorPlay,
  FileText,
  Award,
  BadgeCheck,
  Users2,
} from "lucide-react";
import { instituteOverview } from "@/features/Dashboard/services/dashboardApis";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import { useLanguage } from "@/shared/localization/useLanguage";

// ── Animation ─────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Stat config ───────────────────────────────────────────────────────────────
const STAT_CONFIG = [
  {
    key: "studentsCount",
    labelKey: "totalStudents",
    Icon: GraduationCap,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    valueColor: "text-blue-700",
  },
  {
    key: "nonStudentsCount",
    labelKey: "staff",
    Icon: Users2,
    bg: "bg-purple-50",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    valueColor: "text-purple-700",
  },
  {
    key: "programsCount",
    labelKey: "nav_programs",
    Icon: BookOpen,
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    valueColor: "text-green-700",
  },
  {
    key: "coursesCount",
    labelKey: "courses",
    Icon: MonitorPlay,
    bg: "bg-orange-50",
    border: "border-orange-200",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    valueColor: "text-orange-700",
  },
  {
    key: "contentsCount",
    labelKey: "contents",
    Icon: FileText,
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    valueColor: "text-cyan-700",
  },
  {
    key: "certifiedStudentsCount",
    labelKey: "certifiedStudents",
    Icon: Award,
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    valueColor: "text-yellow-700",
  },
  {
    key: "completedStudentsCount",
    labelKey: "completedStudents",
    Icon: BadgeCheck,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
  },
];

// ── Animated Number ───────────────────────────────────────────────────────────
const AnimatedNumber = ({ value }: { value: number }) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {value.toLocaleString()}
  </motion.span>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  Icon,
  bg,
  border,
  iconBg,
  iconColor,
  valueColor,
}: {
  label: string;
  value: number;
  Icon: React.ElementType;
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}) => (
  <motion.div
    variants={cardVariants}
    className={`flex items-center gap-4 p-4 rounded-xl border ${bg} ${border} hover:shadow-md transition-shadow duration-200`}
  >
    <div className={`${iconBg} rounded-xl p-3 flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-0.5 ${valueColor}`}>
        <AnimatedNumber value={value} />
      </p>
    </div>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────
interface InstituteOverviewProps {
  instituteId: string;
}

const InstituteOverview = ({ instituteId }: InstituteOverviewProps) => {
  const { t } = useLanguage();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["instituteOverview", instituteId],
    queryFn: () => instituteOverview(instituteId),
    enabled: !!instituteId,
  });

  const overviewData = data?.data;

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <CircleLoader />
      </div>
    );

  if (isError)
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
        {t("failedToLoadOverview")}
      </div>
    );

  return (
    <div className="bg-white rounded-xl p-5 mb-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-1 h-6 rounded-full"
          style={{ background: "var(--color-secondary, #0a5c8a)" }}
        />
        <h5 className="text-secondary font-bold text-base m-0">
          {t("instituteOverview")}
        </h5>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
      >
        {STAT_CONFIG.map(({ key, labelKey, Icon, ...colors }) => (
          <StatCard
            key={key}
            label={t(labelKey)}
            value={overviewData?.[key] ?? 0}
            Icon={Icon}
            {...colors}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default InstituteOverview;
