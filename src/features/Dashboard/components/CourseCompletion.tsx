import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchContentCompletion,
  fetchProgramCourse,
} from "../services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Course {
  courseId: number;
  courseName: string;
  completionPercentage: number;
  completedStudentsCount: number;
  totalStudentsCount: number;
  completedEnrollmentsCount: number;
  totalEnrollmentsCount: number;
  completedContentsCount: number;
}

interface Program {
  programId: number;
  programName: string;
  courses: Course[];
}

interface ProgramCourseResponse {
  status: number;
  message: string;
  data: {
    instituteId: number | null;
    limitPerProgram: number;
    programs: Program[];
  };
}

interface ContentItem {
  contentId: number;
  contentName: string;
  completionPercentage: number;
  completedStudentsCount: number;
  totalEnrolledStudentsCount: number;
}

interface ContentCompletionResponse {
  status: number;
  message: string;
  data: {
    instituteId: number | null;
    limit: number;
    contents: ContentItem[];
  };
}

type TabId = "program-course" | "content";

// ─── Shared Row ───────────────────────────────────────────────────────────────

const CompletionRow = ({
  name,
  completion,
  meta,
  index,
}: {
  name: string;
  completion: number;
  meta?: string;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, {
    once: true,
    margin: "-20px",
  });

  const barColor =
    completion >= 80
      ? "bg-emerald-500"
      : completion >= 50
        ? "bg-secondary"
        : "bg-amber-400";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col gap-1.5 group"
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm text-gray-800 truncate leading-tight">
            {name}
          </span>
          {meta && (
            <span className="text-[11px] text-gray-400 leading-tight">
              {meta}
            </span>
          )}
        </div>
        <motion.span
          className="text-sm font-bold text-gray-900 flex-shrink-0 tabular-nums"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.07 + 0.25 }}
        >
          {completion}%
        </motion.span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${completion}%` } : { width: 0 }}
          transition={{
            duration: 1.1,
            delay: index * 0.07 + 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonRow = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.04 }}
    className="flex flex-col gap-1.5"
  >
    <div className="flex justify-between">
      <div className="h-3.5 rounded bg-gray-100 animate-pulse w-2/5" />
      <div className="h-3.5 rounded bg-gray-100 animate-pulse w-8" />
    </div>
    <div className="h-2 w-full rounded-full bg-gray-100 animate-pulse" />
  </motion.div>
);

// ─── Program Course Panel ─────────────────────────────────────────────────────

const ProgramCoursePanel = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["program-course-completion"],
    queryFn: fetchProgramCourse,
  });

  const programs: Program[] =
    (data as ProgramCourseResponse)?.data?.programs ?? [];

  if (isLoading)
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} index={i} />
        ))}
      </div>
    );

  if (isError)
    return (
      <p className="text-sm text-red-400 py-3">
        Failed to load: {(error as Error).message}
      </p>
    );

  if (!programs.length)
    return <p className="text-sm text-gray-400 py-3">No data available.</p>;

  // Flatten programs → courses with program name as meta
  const rows = programs.flatMap((program) =>
    program.courses.map((course) => ({
      key: `${program.programId}-${course.courseId}`,
      name: course.courseName,
      completion: course.completionPercentage,
      meta: `${program.programName} · ${course.completedStudentsCount} / ${course.totalStudentsCount} students`,
    })),
  );

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, index) => (
        <CompletionRow
          key={row.key}
          name={row.name}
          completion={row.completion}
          meta={row.meta}
          index={index}
        />
      ))}
    </div>
  );
};

// ─── Content Completion Panel ─────────────────────────────────────────────────

const ContentCompletionPanel = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["content-completion"],
    queryFn: fetchContentCompletion,
  });

  const contents: ContentItem[] =
    (data as ContentCompletionResponse)?.data?.contents ?? [];

  if (isLoading)
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonRow key={i} index={i} />
        ))}
      </div>
    );

  if (isError)
    return (
      <p className="text-sm text-red-400 py-3">
        Failed to load: {(error as Error).message}
      </p>
    );

  if (!contents.length)
    return <p className="text-sm text-gray-400 py-3">No data available.</p>;

  return (
    <div className="flex flex-col gap-4">
      {contents.map((item, index) => (
        <CompletionRow
          key={item.contentId}
          name={item.contentName}
          completion={item.completionPercentage}
          meta={`${item.completedStudentsCount} / ${item.totalEnrolledStudentsCount} students`}
          index={index}
        />
      ))}
    </div>
  );
};

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: "program-course", label: "Course Program" },
  { id: "content", label: "Content" },
];

// ─── Main component ───────────────────────────────────────────────────────────

const CourseCompletion = () => {
  const [activeTab, setActiveTab] = useState<TabId>("program-course");

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-custom overflow-hidden p-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-5"
      >
        <h5 className="text-lg font-semibold text-gray-900 mb-0.5">
          Completion Overview
        </h5>
        <p className="text-sm text-gray-400">
          Top performance within the institution.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg bg-gray-100 w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex-1 text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-200 z-10"
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-md bg-white shadow-sm"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span
              className={
                activeTab === tab.id ? "text-gray-900" : "text-gray-400"
              }
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === "program-course" ? (
            <ProgramCoursePanel />
          ) : (
            <ContentCompletionPanel />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CourseCompletion;
