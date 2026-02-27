import { Link, useParams } from "react-router-dom";
import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";
import {
  activateStudent,
  deactivateStudent,
} from "@/features/Dashboard/services/dashboardApis";
import LineChartIcon from "@/assets/svgs/LineChart.svg?react";
import PerformanceIcon from "@/assets/svgs/PerformanceIcon.svg?react";
import WarningIcon from "@/assets/svgs/WarningIcon.svg?react";
import CheckGreenIcon from "@/assets/svgs/CheckGreenIcon.svg?react";
import StatCard from "@/features/Dashboard/components/StatCard";
import defaultImage from "@/assets/imgs/ForDev/CourseSection.png";
import { DownloadIcon, EyeIcon, Share2Icon, X } from "lucide-react";

// ── Animation Variants ────────────────────────────────────────────────────────
const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const slideDown = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const infoItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const infoGridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Gradient Section Header ───────────────────────────────────────────────────
const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <div
    className="px-4 py-2.5 flex justify-between items-center flex-wrap gap-2"
    style={{
      background:
        "linear-gradient(135deg, var(--color-secondary, #0a5c8a) 0%, #013856 100%)",
    }}
  >
    <h5 className="text-white text-base sm:text-lg font-semibold">{title}</h5>
    {action}
  </div>
);

// ── Image Modal ───────────────────────────────────────────────────────────────
const ImageModal = ({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        className="relative z-10 max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[80vh] object-contain bg-gray-900"
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── Animated SVG Circle Progress ──────────────────────────────────────────────
interface CircleProgressProps {
  percentage: number;
  color: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
}

const CircleProgress = ({
  percentage,
  color,
  trackColor = "#E5E7EB",
  size = 140,
  strokeWidth = 14,
}: CircleProgressProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-40px" });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (!isInView || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(circumference);
    const controls = animate(circumference, targetOffset, {
      duration: 1.5,
      ease: [0.34, 1.1, 0.64, 1],
      onUpdate: (v) => {
        if (circleRef.current)
          circleRef.current.style.strokeDashoffset = String(v);
      },
    });
    return controls.stop;
  }, [isInView, circumference, targetOffset]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center"
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: "rotate(-90deg)",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))",
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold leading-none"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {percentage}%
        </motion.span>
      </div>
    </div>
  );
};

// ── Legend Item ───────────────────────────────────────────────────────────────
const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <span
      className="w-3 h-3 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
    />
    <span className="text-xs text-gray-600">{label}</span>
  </div>
);

// ── Chart Card ────────────────────────────────────────────────────────────────
interface ChartCardProps {
  title: string;
  percentage: number;
  color: string;
  trackColor?: string;
  legends: { color: string; label: string }[];
}

const ChartCard = ({
  title,
  percentage,
  color,
  trackColor,
  legends,
}: ChartCardProps) => (
  <motion.div
    variants={fadeUp}
    className="rounded-xl overflow-hidden bg-white shadow-custom"
  >
    <SectionHeader title={title} />
    <div className="p-4 sm:p-5 flex flex-col items-center gap-4">
      <CircleProgress
        percentage={percentage}
        color={color}
        trackColor={trackColor}
        size={130}
        strokeWidth={13}
      />
      <div className="flex flex-col sm:flex-row justify-between w-full gap-2 px-1">
        {legends.map((l) => (
          <LegendDot key={l.label} color={l.color} label={l.label} />
        ))}
      </div>
    </div>
  </motion.div>
);

// ── Progress Bar Row ──────────────────────────────────────────────────────────
interface ProgressRowProps {
  title: string;
  subtitle: string;
  percentage: number;
}

const ProgressRow = ({ title, subtitle, percentage }: ProgressRowProps) => {
  const barRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(barRef as React.RefObject<Element>, {
    once: true,
    margin: "-20px",
  });

  return (
    <div className="p-3 border border-gray-200 rounded-xl bg-gray-50">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="min-w-0">
          <h5 className="font-bold text-gray-800 text-sm leading-snug">
            {title}
          </h5>
          <span className="text-xs text-gray-500">{subtitle}</span>
        </div>
        <span className="text-xl sm:text-2xl font-bold text-secondary flex-shrink-0">
          {percentage}%
        </span>
      </div>
      <div
        ref={barRef}
        className="h-1.5 bg-gray-200 w-full rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--color-secondary, #0a5c8a), #013856)",
          }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </div>
    </div>
  );
};

// ── Activity Log Table ────────────────────────────────────────────────────────
const activityLogs = [
  { date: "Feb 20, 2026", activity: "Logged In", details: "10:30 AM" },
  {
    date: "Feb 19, 2026",
    activity: "Completed Lesson",
    details: "Python Advanced Functions",
  },
  {
    date: "Feb 15, 2026",
    activity: "Exam Attempt",
    details: "Data Science Quiz - Score: 87%",
  },
  {
    date: "Feb 11, 2026",
    activity: "Certificate Downloaded",
    details: "Web Development Certificate",
  },
];

const activityBadgeColor: Record<string, string> = {
  Login: "bg-blue-100 text-blue-700",
  Logout: "bg-gray-100 text-gray-600",
  "Logged In": "bg-purple-100 text-purple-700",
  "Certificate Downloaded": "bg-yellow-100 text-yellow-700",
  "Completed Lesson": "bg-green-100 text-green-700",
  "Exam Attempted": "bg-orange-100 text-orange-700",
  "Exam Attempt": "bg-teal-100 text-teal-700",
};

const ActivityLogTable = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(tableRef as React.RefObject<Element>, {
    once: true,
    margin: "-40px",
  });

  return (
    <div ref={tableRef} className="overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr
            className="text-left"
            style={{
              background: "linear-gradient(135deg, #f0f6fb 0%, #e8f2f9 100%)",
            }}
          >
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-36 sm:w-48">
              Date
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-40 sm:w-44">
              Activity
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {activityLogs.map((log, i) => (
            <motion.tr
              key={i}
              variants={rowVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={i}
              transition={{ delay: i * 0.06 }}
              className={`border-t border-gray-100 transition-colors duration-150 hover:bg-blue-50/40 ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50/60"
              }`}
            >
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                {log.date}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                    activityBadgeColor[log.activity] ??
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {log.activity}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{log.details}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Exam Result Card ──────────────────────────────────────────────────────────
const ExamCard = ({
  title,
  attempts,
  score,
  passed,
}: {
  title: string;
  attempts: number;
  score: string;
  passed: boolean;
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
    <div className="flex justify-between items-start mb-1.5 gap-2">
      <h5 className="font-bold text-gray-800 text-sm leading-snug">{title}</h5>
      <span
        className={`text-white text-xs font-semibold px-3 py-0.5 rounded-full flex-shrink-0 ${
          passed ? "bg-green-600" : "bg-red-500"
        }`}
      >
        {passed ? "Pass" : "Fail"}
      </span>
    </div>
    <div className="flex justify-between text-xs text-gray-500 mt-1">
      <span>Attempts: {attempts}</span>
      <span className="font-semibold text-gray-700">{score}</span>
    </div>
  </div>
);

// ── Certificate Card ──────────────────────────────────────────────────────────
const CertificateCard = ({
  title,
  issued,
}: {
  title: string;
  issued: string;
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
    <h5 className="font-bold text-gray-800 text-sm mb-1.5 leading-snug">
      {title}
    </h5>
    <div className="flex justify-between items-center gap-2 flex-wrap">
      <p className="text-xs text-gray-500">Issued: {issued}</p>
      <div className="flex gap-1.5">
        {[EyeIcon, DownloadIcon, Share2Icon].map((Icon, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-lg hover:bg-white transition-colors duration-150"
          >
            <Icon className="text-secondary w-4 h-4" />
          </motion.button>
        ))}
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const StudentInInstitute = () => {
  const { studentId } = useParams();
  const isActive = false;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const infoFields = [
    { label: "Student Name", value: "Abdullah Shaaban", col: 1, row: 1 },
    { label: "Student ID", value: "STU-2024-0847", col: 2, row: 1 },
    {
      label: "E-mail",
      value: "yehyaraouf231@gmail.com",
      col: 1,
      row: 2,
      breakAll: true,
    },
    { label: "Institute", value: "Alkatamia", col: 2, row: 2 },
    { label: "Phone Number", value: "0122 362 5265", col: 1, row: 3 },
    { label: "Program", value: "Alkatamia", col: 2, row: 3 },
    { label: "Created at", value: "5/11/2025 17:48 pm", col: 1, row: 4 },
    { label: "Created by", value: "Mohamed Abdelsalam Ahmed", col: 2, row: 4 },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      {/* Image Modal */}
      {isImageModalOpen && (
        <ImageModal
          src={defaultImage}
          alt="Learning Path"
          onClose={() => setIsImageModalOpen(false)}
        />
      )}

      {/* Page Title */}
      <motion.h2 variants={slideDown}>Student</motion.h2>

      {/* Stats Grid */}
      <motion.div
        variants={gridVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
      >
        <StatCard
          title="Overall Progress"
          value={68}
          borderColor="border-secondary"
          textColor="text-secondary"
          bgColor="bg-primary"
          icon={<LineChartIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title="Average Grade"
          value={68}
          subLabel="Batch avg: 75%"
          borderColor="border-[#9F00BF]"
          textColor="text-[#9F00BF]"
          bgColor="bg-[#F9DDFF]"
          icon={<PerformanceIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title="Passed Exams"
          value={68}
          subLabel="of 12 total"
          borderColor="border-green-600"
          textColor="text-green-600"
          bgColor="bg-green-100"
          icon={<CheckGreenIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title="Failed Exams"
          value={68}
          subLabel="of 12 total"
          borderColor="border-[#DB6600]"
          textColor="text-[#DB6600]"
          bgColor="bg-[#FFF2E7]"
          icon={<WarningIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
      </motion.div>

      {/* Student Information */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl bg-white overflow-hidden mt-4 shadow-custom"
      >
        <SectionHeader
          title="Student Information"
          action={
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
            >
              <Link
                to=""
                className="flex bg-white items-center gap-2 px-3 py-1 rounded-xl shadow-md transition-colors duration-200"
              >
                <EditIcon className="h-6 w-5 rotate-270 flex-shrink-0" />
                <span className="text-secondary font-bold text-sm whitespace-nowrap">
                  Edit Student Information
                </span>
              </Link>
            </motion.div>
          }
        />
        <div className="p-4">
          <motion.div
            variants={infoGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5"
          >
            {infoFields.map(({ label, value, col, row, breakAll }) => (
              <motion.div
                key={label}
                variants={infoItemVariants}
                className={`flex flex-col gap-0.5 lg:col-start-${col} lg:row-start-${row}`}
              >
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  {label}
                </span>
                <p
                  className={`font-medium text-gray-800 text-sm sm:text-base ${breakAll ? "break-all" : ""}`}
                >
                  {value}
                </p>
              </motion.div>
            ))}

            {/* Col 3 — Account Status + Photo */}
            <motion.div
              variants={infoItemVariants}
              className="lg:col-start-3 lg:row-start-1 lg:row-span-4 flex flex-col gap-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Account Status
                </span>
                <div className="w-fit mt-1">
                  <ActiveStatusButton
                    itemId={studentId ?? ""}
                    activateApi={activateStudent}
                    deactivateApi={deactivateStudent}
                    isActive={isActive}
                    refetchKey="getStudentInInstitute"
                    showModal
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Learning Path Photo
                </span>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="flex-1 rounded-xl overflow-hidden border border-gray-100 shadow-sm min-h-[160px] sm:min-h-[180px] cursor-pointer relative group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img
                    src={defaultImage}
                    alt="Learning Path"
                    className="w-full h-full max-h-[250px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-full p-2 transition-all duration-200">
                      <EyeIcon className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Student Courses */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl bg-white overflow-hidden mt-4 shadow-custom"
      >
        <SectionHeader
          title="Student Courses (3)"
          action={
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
            >
              <Link
                to=""
                className="underline text-white px-2 font-bold text-base sm:text-lg"
              >
                view all
              </Link>
            </motion.div>
          }
        />
        <div className="p-4">
          <motion.div
            variants={infoGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            <ProgressRow
              title="Introduction to Data Science"
              subtitle="Start: Feb 1, 2024"
              percentage={72}
            />
            <ProgressRow
              title="Machine Learning Fundamentals"
              subtitle="Start: Mar 10, 2024"
              percentage={55}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Learning Paths */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl bg-white overflow-hidden mt-4 shadow-custom"
      >
        <SectionHeader
          title="Learning Paths (2)"
          action={
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
            >
              <Link
                to=""
                className="underline text-white px-2 font-bold text-base sm:text-lg"
              >
                view all
              </Link>
            </motion.div>
          }
        />
        <div className="p-4">
          <motion.div
            variants={infoGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            <ProgressRow
              title="Data Science Track"
              subtitle="Start: Feb 1, 2024"
              percentage={68}
            />
            <ProgressRow
              title="AI & Deep Learning"
              subtitle="Start: Apr 5, 2024"
              percentage={40}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Chart Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        <ChartCard
          title="Student's Courses Out of Total Program Courses"
          percentage={80}
          color="var(--color-tertiary, #0ea5e9)"
          trackColor="#E5E7EB"
          legends={[
            {
              color: "var(--color-tertiary, #0ea5e9)",
              label: "Student Courses: 8",
            },
            { color: "#D1D5DB", label: "Program Courses: 10" },
          ]}
        />
        <ChartCard
          title="Progress Distribution"
          percentage={68}
          color="#16a34a"
          trackColor="#E5E7EB"
          legends={[
            { color: "#16a34a", label: "Completed: 68%" },
            { color: "#D1D5DB", label: "Remaining: 32%" },
          ]}
        />
      </div>

      {/* Exam Results & Certificates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        <motion.div
          variants={fadeUp}
          className="rounded-xl bg-white overflow-hidden shadow-custom"
        >
          <SectionHeader title="Exam Results" />
          <div className="p-4 flex flex-col gap-2">
            <ExamCard
              title="Advanced Python Programming"
              attempts={1}
              score="8/10"
              passed
            />
            <ExamCard
              title="Data Structures & Algorithms"
              attempts={2}
              score="5/10"
              passed={false}
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-xl bg-white overflow-hidden shadow-custom"
        >
          <SectionHeader title="Certificates" />
          <div className="p-4 flex flex-col gap-2">
            <CertificateCard
              title="Python Programming Certificate"
              issued="Feb 15, 2024"
            />
            <CertificateCard
              title="Data Science Fundamentals"
              issued="Apr 3, 2024"
            />
          </div>
        </motion.div>
      </div>

      {/* Activity Log */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl bg-white overflow-hidden mt-4 shadow-custom"
      >
        <SectionHeader title="Activity Log" />
        <ActivityLogTable />
      </motion.div>
    </motion.div>
  );
};

export default StudentInInstitute;
