import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTopFaculty } from "../services/dashboardApis";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RoleStats {
  roleTitle: string;
  totalStaff: number;
  enrolledStaffCount: number;
  notEnrolledStaffCount: number;
  engagementPercentage: number;
}

interface TopFacultyData {
  instituteId: number;
  totalStaff: number;
  enrolledStaffCount: number;
  notEnrolledStaffCount: number;
  engagementPercentage: number;
  roles: RoleStats[];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const FacultyRow = ({ role, index }: { role: RoleStats; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, {
    once: true,
    margin: "-20px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-white"
    >
      {/* Left — role title + staff count */}
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-gray-900">
          {role.roleTitle}
        </span>
        <span className="text-xs text-gray-400">
          {role.enrolledStaffCount} / {role.totalStaff} enrolled
        </span>
      </div>

      {/* Right — engagement badge */}
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{
          duration: 0.35,
          delay: index * 0.1 + 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex-shrink-0 text-xs font-semibold text-white bg-secondary px-4 py-1.5 rounded-full whitespace-nowrap"
      >
        {role.engagementPercentage}% engagement
      </motion.span>
    </motion.div>
  );
};

const SkeletonRow = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-white"
  >
    <div className="flex flex-col gap-1.5">
      <div className="h-3.5 w-28 rounded bg-gray-100 animate-pulse" />
      <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
    </div>
    <div className="h-6 w-28 rounded-full bg-gray-100 animate-pulse" />
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const TopFacultyMembers = () => {
  const {
    data: TopFacultyMembersData,
    isLoading,
    isError,
    error,
  } = useQuery<TopFacultyData, Error>({
    queryKey: ["top-faculty-members"],
    queryFn: fetchTopFaculty,
  });
  const data = TopFacultyMembersData?.data;

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
          Top Faculty Members
        </h5>
        <p className="text-sm text-gray-400">
          Most active instructors and reviewers.
        </p>
      </motion.div>

      {/* Overall summary pill (visible once loaded) */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 mb-4 text-xs text-gray-500"
        >
          <span className="font-medium text-gray-700">{data?.totalStaff}</span>{" "}
          total staff
          <span className="text-gray-300">·</span>
          <span className="font-medium text-gray-700">
            {data.enrolledStaffCount}
          </span>{" "}
          enrolled
          <span className="text-gray-300">·</span>
          <span className="font-medium text-gray-700">
            {data.engagementPercentage}%
          </span>{" "}
          overall engagement
        </motion.div>
      )}

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {isLoading && [0, 1, 2].map((i) => <SkeletonRow key={i} index={i} />)}

        {isError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500 py-2"
          >
            Failed to load data: {error.message}
          </motion.p>
        )}

        {data?.roles?.map((role, index) => (
          <FacultyRow key={role.roleTitle} role={role} index={index} />
        ))}

        {data?.roles?.length === 0 && (
          <p className="text-sm text-gray-400 py-2">No roles found.</p>
        )}
      </div>
    </div>
  );
};

export default TopFacultyMembers;
