import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HomeChart from "./HomeChart";
import {
  fetchStudentEngagement,
  fetchCertificatesIssued,
  fetchPackagesCompleted,
  fetchStudentActivityTrend,
} from "../services/dashboardApis";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ROLES } from "@/shared/utils/globals";

interface HomeChartSliderProps {
  programId?: number;
  isSuperAdmin?: boolean;
}

const GROWTH_DUMMY_DATA = {
  categories: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
  series: [
    { name: "Institutions", data: [12, 18, 15, 24, 21, 30] },
    { name: "Students", data: [140, 210, 195, 310, 275, 420] },
  ],
};

const STUDENT_ACTIVITY_DUMMY_DATA = {
  categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  series: [
    {
      name: "Weekly Active Students",
      data: [210, 185, 240, 198, 267, 143, 89],
    },
    { name: "Content Interactions", data: [540, 420, 610, 480, 700, 310, 190] },
  ],
};

const superAdminSlides = [
  {
    heading: "Student Performance",
    subHeading: "Subscriptions and active engagement rate",
    label1: "Students",
    label2: "Active Students",
    dataSource: "students" as const,
    dataKey1: "students",
    dataKey2: "activeStudents",
  },
  {
    heading: "Learning Paths",
    subHeading: "Subscriptions and active engagement rate",
    label1: "Completed Packages",
    dataSource: "learningPaths" as const,
    dataKey1: "completedPackages",
  },
  {
    heading: "Certificates",
    subHeading: "Number of issued certificates",
    label1: "Certificates",
    dataSource: "certificates" as const,
    dataKey1: "certificates",
  },
  {
    heading: "Growth Overview",
    subHeading:
      "Institutions, students, and revenue growth over the last 6 months.",
    label1: "Institutions",
    label2: "Students",
    dataSource: "students" as const,
    dataKey1: "institutions",
    dataKey2: "students",
  },
];

const otherRoleSlides = [
  {
    heading: "Student Performance",
    subHeading: "Subscriptions and active engagement rate",
    label1: "Students",
    label2: "Active Students",
    dataSource: "students" as const,
    dataKey1: "students",
    dataKey2: "activeStudents",
  },
  {
    heading: "Learning Paths",
    subHeading: "Subscriptions and active engagement rate",
    label1: "Completed Packages",
    dataSource: "learningPaths" as const,
    dataKey1: "completedPackages",
  },
  {
    heading: "Certificates",
    subHeading: "Number of issued certificates",
    label1: "Certificates",
    dataSource: "certificates" as const,
    dataKey1: "certificates",
  },
  {
    heading: "Student Activity",
    subHeading: "Weekly active students and content interactions trend.",
    label1: "Weekly Active Students",
    label2: "Content Interactions",
    dataSource: "students" as const,
    dataKey1: "weeklyActiveStudents",
    dataKey2: "contentInteractions",
  },
];

function ChartSkeleton() {
  return (
    <div className="px-6 pb-4 animate-pulse">
      <div className="h-[220px] bg-gray-100 rounded-xl w-full" />
    </div>
  );
}

function ChartError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-6 pb-4 flex flex-col items-center justify-center h-[220px] gap-3">
      <p className="text-sm text-gray-400">Failed to load chart data.</p>
      <button
        onClick={onRetry}
        className="text-xs text-[#017BBC] underline hover:opacity-70 transition"
      >
        Retry
      </button>
    </div>
  );
}

export default function HomeChartSlider({
  programId,
  isSuperAdmin = false,
}: HomeChartSliderProps) {
  const [current, setCurrent] = useState(0);
  const { role } = useAuth();

  const isSuperAdminRole = role === ROLES.SUPER_ADMIN;
  const slides = isSuperAdminRole ? superAdminSlides : otherRoleSlides;

  const resolvedId = isSuperAdmin ? undefined : programId;

  const studentQuery = useQuery({
    queryKey: ["student-engagement", resolvedId],
    queryFn: () => fetchStudentEngagement(resolvedId),
    enabled: current === 0,
  });

  const packagesQuery = useQuery({
    queryKey: ["packages-completed", resolvedId],
    queryFn: () => fetchPackagesCompleted(resolvedId),
    enabled: current === 1,
  });

  const certificatesQuery = useQuery({
    queryKey: ["certificates-issued", resolvedId],
    queryFn: () => fetchCertificatesIssued(resolvedId),
    enabled: current === 2,
  });

  // Slide 3: Growth for super admin, Student Activity (dummy) for others
  const slide3Query = useQuery({
    queryKey: isSuperAdminRole
      ? ["growth-overview"]
      : ["student-activity-trend", resolvedId],
    queryFn: () =>
      isSuperAdminRole
        ? Promise.resolve(GROWTH_DUMMY_DATA)
        : fetchStudentActivityTrend(resolvedId),
    enabled: current === 3,
  });

  const queryBySlide = [
    studentQuery,
    packagesQuery,
    certificatesQuery,
    slide3Query,
  ];
  const activeQuery = queryBySlide[current];

  return (
    <div className="w-full">
      <div className="mb-6 p-6 pb-0">
        <h5 className="text-xl font-bold text-gray-900 mb-1">
          {slides[current]?.heading}
        </h5>
        <p className="text-[#808080] text-sm">{slides[current]?.subHeading}</p>
      </div>

      {activeQuery.isLoading || activeQuery.isFetching ? (
        <ChartSkeleton />
      ) : activeQuery.isError ? (
        <ChartError onRetry={activeQuery.refetch} />
      ) : (
        <HomeChart {...slides[current]} chartData={activeQuery.data} />
      )}

      <div className="flex justify-center gap-3 mt-4 pb-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 flex items-center justify-center ${
              i === current
                ? "w-8 h-3 bg-[#017BBC] rounded-full scale-110"
                : "w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
