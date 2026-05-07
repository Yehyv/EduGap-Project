import { useQuery } from "@tanstack/react-query";
import { fetchTopInstitutesEngagement } from "../services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Institute {
  instituteId: number;
  instituteName: string;
  studentsCount: number;
  engagedStudentsCount: number;
  engagementPercentage: number;
  completedStudentsCount: number;
  completionPercentage: number;
}

// ── Progress Bar ──────────────────────────────────────────────────────────────

const ProgressBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center gap-2">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800">{value}%</span>
    </div>
    <div className="w-36 h-3 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-secondary"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// ── Institution Row ───────────────────────────────────────────────────────────

const InstitutionRow = ({ institute }: { institute: Institute }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-2 flex-wrap border border-gray-100 rounded-xl">
    <div className="min-w-[160px]">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-sm font-semibold text-gray-900">
          {institute.instituteName}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
          {institute.studentsCount.toLocaleString()} students
        </span>
      </div>
      <p className="text-xs text-gray-400">
        Engagement and completion indicators
      </p>
    </div>

    <div className="flex gap-5 items-center flex-shrink-0">
      <ProgressBar label="Engagement" value={institute.engagementPercentage} />
      <ProgressBar label="Completion" value={institute.completionPercentage} />
    </div>
  </div>
);

// ── Skeleton Row ──────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="flex items-center justify-between gap-4 px-5 py-2 flex-wrap border border-gray-100 rounded-xl animate-pulse">
    <div className="min-w-[160px] flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="h-4 w-32 rounded bg-gray-100" />
        <div className="h-4 w-16 rounded-full bg-gray-100" />
      </div>
      <div className="h-3 w-40 rounded bg-gray-100" />
    </div>
    <div className="flex gap-5">
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-3 w-36 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const TopInstitutions = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["top-institutes-engagement"],
    queryFn: fetchTopInstitutesEngagement,
  });

  const institutes: Institute[] = data?.data?.institutes ?? [];

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-custom overflow-hidden">
      {/* Header */}
      <div className="px-5 py-2 border-b border-gray-100">
        <h5 className="text-lg font-semibold text-gray-900 mb-0.5">
          Top Institutions
        </h5>
        <p className="text-sm text-gray-400">
          Performance ranking by engagement and completion.
        </p>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2 p-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : isError ? (
          <p className="text-sm text-red-400 py-4 px-3">
            Failed to load institutions.
          </p>
        ) : institutes.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 px-3">
            No institutions available.
          </p>
        ) : (
          institutes.map((institute) => (
            <InstitutionRow key={institute.instituteId} institute={institute} />
          ))
        )}
      </div>
    </div>
  );
};

export default TopInstitutions;
