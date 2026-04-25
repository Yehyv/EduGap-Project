import { Link, useParams } from "react-router-dom";
import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";
import {
  activateStudent,
  deactivateStudent,
  getExamResults,
  getOverallProgress,
  getPassedExamsAverage,
  getStudentCertificates,
  getStudentContentsProgress,
  getStudentCoursesProgressSummary,
  getStudentDetails,
  getStudentLearningPaths,
} from "@/features/Dashboard/services/dashboardApis";
import LineChartIcon from "@/assets/svgs/LineChart.svg?react";
import CheckGreenIcon from "@/assets/svgs/CheckGreenIcon.svg?react";
import StatCard from "@/features/Dashboard/components/StatCard";
import { DownloadIcon, EyeIcon, Share2Icon, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/AuthContext";
import { formatDate, ROLES } from "@/shared/utils/globals";

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

// ── Types ─────────────────────────────────────────────────────────────────────
interface InfoField {
  label: string;
  value?: string | number | null;
  breakAll?: boolean;
}

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

// ── Exam Result Card ──────────────────────────────────────────────────────────
const ExamCard = ({
  title,
  passPercent,
  totalQuestions,
  date,
  passed,
}: {
  title: string;
  passPercent: number;
  totalQuestions: number;
  date: string;
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
      <div>
        <span>Pass Percent: {passPercent}</span>
        <span className="inline-block ms-2">Date: {date}</span>
      </div>
      <span className="font-semibold text-gray-700">
        Total Questions: {totalQuestions}
      </span>
    </div>
  </div>
);

// ── Info Field Item ───────────────────────────────────────────────────────────
const InfoFieldItem = ({ label, value, breakAll }: InfoField) => (
  <motion.div variants={infoItemVariants} className="flex flex-col gap-0.5">
    <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
      {label}
    </span>
    <p
      className={`font-medium text-gray-800 text-sm sm:text-base ${breakAll ? "break-all" : ""}`}
    >
      {value ?? "-"}
    </p>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const StudentInInstitute = () => {
  const { studentId, instituteId } = useParams();

  const { role } = useAuth();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const { data: overallProgressData } = useQuery({
    queryKey: ["getOverallProgress", studentId],
    queryFn: () => getOverallProgress(studentId ?? ""),
    enabled: !!studentId,
  });

  const { data: certificatesData } = useQuery({
    queryKey: ["studentCertificates", studentId],
    queryFn: () => getStudentCertificates(studentId ?? ""),
    enabled: !!studentId,
  });

  const { data: passedExamData } = useQuery({
    queryKey: ["getPassedExamsAverage", studentId],
    queryFn: () => getPassedExamsAverage(studentId ?? ""),
    enabled: !!studentId,
  });

  const { data: studentContentsProgressData } = useQuery({
    queryKey: ["getStudentContentsProgress", studentId],
    queryFn: () => getStudentContentsProgress(studentId ?? ""),
    enabled: !!studentId,
  });

  const { data: studentCoursesProgressSummary } = useQuery({
    queryKey: ["studentCoursesProgressSummary", studentId],
    queryFn: () => getStudentCoursesProgressSummary(studentId ?? ""),
    enabled: !!studentId,
  });

  const { data: studentLearningPathsData } = useQuery({
    queryKey: ["studentLearningPaths", studentId],
    queryFn: () => getStudentLearningPaths(studentId ?? ""),
    enabled: !!studentId,
  });

  const { data: examResultsData } = useQuery({
    queryKey: ["examResults", studentId],
    queryFn: () => getExamResults(studentId ?? ""),
    enabled: !!studentId,
  });

  const { data: userDataResponse } = useQuery({
    queryKey: ["userDetails", studentId],
    queryFn: () => getStudentDetails(studentId ?? ""),
    enabled: !!studentId,
  });

  console.log(studentLearningPathsData?.data?.length);

  const userData = userDataResponse?.data;
  const isUserStudent =
    !!userData && userData?.role?.role_title === ROLES.STUDENT;
  const editUserPage = isUserStudent
    ? `/dashboard/institutes/${instituteId}/student/edit/${studentId}`
    : `/dashboard/users/edit/${studentId}`;

  const isActive = userData?.isActive;
  const overallProgress = overallProgressData?.data?.percentage ?? 0;
  const passedExam = passedExamData?.data?.passedExams;

  // ── Info fields — always shown ────────────────────────────────────────────
  const commonFields: InfoField[] = [
    { label: "User Name", value: userData?.full_name },
    { label: "E-mail", value: userData?.email, breakAll: true },
    { label: "User Role", value: userData?.role?.role_title },
    { label: "National ID", value: userData?.national_id },
    { label: "Institute", value: userData?.institute?.name },
    { label: "Phone Key", value: `+${userData?.phone_key ?? ""}` },
    { label: "Phone Number", value: userData?.phone },
    { label: "Created at", value: userData?.createdAt },
    { label: "Created by", value: userData?.createdBy?.full_name },
  ];

  // ── Info fields — only shown when user IS a student ───────────────────────
  const studentOnlyFields: InfoField[] = [
    { label: "Student ID", value: userData?.studentId },
    { label: "Program", value: userData?.program },
  ];
  const infoFields: InfoField[] = isUserStudent
    ? [
        commonFields[0],
        studentOnlyFields[0],
        ...commonFields.slice(1),
        studentOnlyFields[1],
      ]
    : commonFields;

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      {/* Image Modal */}
      {isImageModalOpen && (
        <ImageModal
          src={userData?.user_image}
          alt="User Image"
          onClose={() => setIsImageModalOpen(false)}
        />
      )}

      {/* Page Title */}
      <motion.h2 variants={slideDown}>
        {isUserStudent ? "Student" : "User"}
      </motion.h2>

      {/* Stats Grid — only meaningful for students */}
      {isUserStudent && (
        <motion.div
          variants={gridVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
        >
          <StatCard
            title="Overall Progress"
            value={overallProgress}
            subLabel="Enrolled Courses"
            borderColor="border-secondary"
            textColor="text-secondary"
            bgColor="bg-primary"
            icon={<LineChartIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          />
          <StatCard
            title="Passed Exams"
            value={passedExam}
            subLabel="of 0 total"
            borderColor="border-green-600"
            textColor="text-green-600"
            bgColor="bg-green-100"
            icon={<CheckGreenIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          />
        </motion.div>
      )}

      {/* Student / User Information */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl bg-white overflow-hidden mt-4 shadow-custom"
      >
        <SectionHeader
          title={isUserStudent ? "Student Information" : "User Information"}
          action={
            role === ROLES.SUPER_ADMIN ? (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
              >
                <Link
                  to={editUserPage}
                  className="flex bg-white items-center gap-2 px-3 py-1 rounded-xl shadow-md transition-colors duration-200"
                >
                  <EditIcon className="h-6 w-5 rotate-270 flex-shrink-0" />
                  <span className="text-secondary font-bold text-sm whitespace-nowrap">
                    {isUserStudent
                      ? "Edit Student Information"
                      : "Edit User Information"}
                  </span>
                </Link>
              </motion.div>
            ) : null
          }
        />
        <div className="p-4">
          <motion.div
            key={`info-grid-${isUserStudent}`}
            variants={infoGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5"
          >
            {infoFields.map((field, index) => (
              <InfoFieldItem key={`${index}-${field.label}`} {...field} />
            ))}

            {/* Col 3 — Account Status + Photo (always shown) */}
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
                    refetchKey="userDetails"
                    showModal
                    withReasons
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  User Image
                </span>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="flex justify-center rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer relative group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img
                    src={userData?.user_image}
                    alt="User Image"
                    className="w-30 object-cover"
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

      {/* Below sections — only shown for students */}
      <>
        {/* Student Courses */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl bg-white overflow-hidden mt-4 shadow-custom"
        >
          <SectionHeader
            title={`Student Courses (${studentContentsProgressData?.data?.count ?? 0})`}
          />
          <div className="p-4">
            {studentContentsProgressData?.data?.items?.length === 0 && (
              <p className="text-gray-400 text-center">No Data Available</p>
            )}
            <motion.div
              variants={infoGridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {studentContentsProgressData?.data?.items?.map((item) => (
                <ProgressRow
                  key={item?.name}
                  title={item?.name}
                  subtitle={`Start: ${formatDate(item?.startDate) ?? "-"}`}
                  percentage={item?.percentage}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Learning Paths */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl bg-white overflow-hidden mt-4 shadow-custom"
        >
          <SectionHeader
            title={`Learning Paths (${studentLearningPathsData?.data?.length ?? 0})`}
          />
          <div className="p-4">
            {studentLearningPathsData?.data?.length === 0 && (
              <p className="text-gray-400 text-center">No Data Available</p>
            )}
            <motion.div
              variants={infoGridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {studentLearningPathsData?.data?.map((item, index) => (
                <ProgressRow
                  key={index}
                  title={item?.name ?? "Learning Path"}
                  subtitle={`Start: ${item?.startDate ?? "-"}`}
                  percentage={item?.percentage ?? 0}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Chart Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          <ChartCard
            title="Student's Courses Out of Total Program Courses"
            percentage={studentCoursesProgressSummary?.data?.percentage ?? 0}
            color="var(--color-tertiary, #0ea5e9)"
            trackColor="#E5E7EB"
            legends={[
              {
                color: "var(--color-tertiary, #0ea5e9)",
                label: `Student Courses: ${studentCoursesProgressSummary?.data?.studentCourses ?? 0}`,
              },
              {
                color: "#D1D5DB",
                label: `Program Courses: ${studentCoursesProgressSummary?.data?.totalProgramCourses ?? 0}`,
              },
            ]}
          />
          <ChartCard
            title="Progress Distribution"
            percentage={overallProgress}
            color="#16a34a"
            trackColor="#E5E7EB"
            legends={[
              {
                color: "#16a34a",
                label: `Completed: ${overallProgress}%`,
              },
              {
                color: "#D1D5DB",
                label: `Remaining: ${100 - overallProgress}%`,
              },
            ]}
          />
        </div>

        {/* Exam Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          <motion.div
            variants={fadeUp}
            className="rounded-xl bg-white shadow-custom overflow-hidden"
          >
            <SectionHeader title="Exam Results" />
            <div className="p-4 flex flex-col gap-2 max-h-[200px] overflow-auto">
              {examResultsData?.data?.items?.length === 0 && (
                <p className="text-gray-400 text-center">No Data Available</p>
              )}
              {examResultsData?.data?.items?.map((exam) => (
                <ExamCard
                  key={exam?.examName}
                  title={exam?.examName}
                  passPercent={exam?.passPercent}
                  passed={exam?.result === "Passed"}
                  date={exam?.passedAt}
                  totalQuestions={exam?.totalQuestions}
                />
              ))}
            </div>
          </motion.div>
          {/* Certificates */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl bg-white shadow-custom overflow-hidden"
          >
            <SectionHeader
              title={`Certificates (${certificatesData?.data?.count ?? 0})`}
            />
            <div className="p-4 flex flex-col gap-2 max-h-[250px] overflow-auto">
              {certificatesData?.data?.items?.length === 0 && (
                <p className="text-gray-400 text-center">No Data Available</p>
              )}
              {certificatesData?.data?.items?.map((cert) => (
                <div
                  key={cert.certificateId}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                >
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <h5 className="font-bold text-gray-800 text-sm leading-snug">
                      {cert.title}
                    </h5>
                    <span className="text-white text-xs font-semibold px-3 py-0.5 rounded-full flex-shrink-0 bg-secondary uppercase">
                      {cert.language}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2 flex-wrap mt-1">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs text-gray-500">
                        Issued:{" "}
                        {new Date(cert.issueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {cert.serialNumber}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {(
                        [
                          { Icon: EyeIcon, label: "View" },
                          { Icon: DownloadIcon, label: "Download" },
                          { Icon: Share2Icon, label: "Share" },
                        ] as const
                      ).map(({ Icon, label }) => (
                        <motion.button
                          key={label}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          title={label}
                          className="p-1.5 rounded-lg hover:bg-white transition-colors duration-150 border border-transparent hover:border-gray-200"
                        >
                          <Icon className="text-secondary w-4 h-4" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </>
    </motion.div>
  );
};

export default StudentInInstitute;
