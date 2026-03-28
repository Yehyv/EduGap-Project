import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HomeChart from "./HomeChart";
import {
  fetchStudentEngagement,
  fetchCertificatesIssued,
  fetchPackagesCompleted,
} from "../services/dashboardApis";

interface HomeChartSliderProps {
  programId?: number;
  isSuperAdmin?: boolean;
}

// label1 / label2 must exactly match the `name` field in the API series response
// so that transformChartData can find the right series by name.
const slides = [
  {
    heading: "Student Performance",
    subHeading: "Subscriptions and active engagement rate",
    label1: "Students", // matches series[n].name === "Students"
    label2: "Active Students", // matches series[n].name === "Active Students"
    dataSource: "students" as const,
    dataKey1: "students",
    dataKey2: "activeStudents",
  },
  {
    heading: "Learning Paths",
    subHeading: "Subscriptions and active engagement rate",
    label1: "Completed Packages", // matches series[0].name === "Completed Packages"
    dataSource: "learningPaths" as const,
    dataKey1: "completedPackages",
  },
  {
    heading: "Certificates",
    subHeading: "Number of issued certificates",
    label1: "Certificates", // matches series[0].name === "Certificates"
    dataSource: "certificates" as const,
    dataKey1: "certificates",
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

  const queryBySlide = [studentQuery, packagesQuery, certificatesQuery];
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
