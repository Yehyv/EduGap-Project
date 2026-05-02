interface Institution {
  id: number;
  name: string;
  students: number;
  engagement: number;
  completion: number;
}

const DUMMY_INSTITUTIONS: Institution[] = [
  {
    id: 1,
    name: "Future Academy",
    students: 740,
    engagement: 92,
    completion: 81,
  },
  {
    id: 2,
    name: "Nile Institute",
    students: 620,
    engagement: 88,
    completion: 76,
  },
  {
    id: 3,
    name: "Heliopolis Tech",
    students: 510,
    engagement: 84,
    completion: 74,
  },
  {
    id: 4,
    name: "Delta Business School",
    students: 430,
    engagement: 78,
    completion: 69,
  },
];

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
const InstitutionRow = ({ institution }: { institution: Institution }) => (
  <div
    className={`flex items-center justify-between gap-4 px-5 py-2 flex-wrap border border-gray-100 rounded-xl`}
  >
    <div className="min-w-[160px]">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-sm font-semibold text-gray-900">
          {institution.name}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
          {institution.students.toLocaleString()} students
        </span>
      </div>
      <p className="text-xs text-gray-400">
        Engagement and completion indicators
      </p>
    </div>

    <div className="flex gap-5 items-center flex-shrink-0">
      <ProgressBar label="Engagement" value={institution.engagement} />
      <ProgressBar label="Completion" value={institution.completion} />
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const TopInstitutions = () => {
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
        {DUMMY_INSTITUTIONS.map((institution) => (
          <InstitutionRow key={institution.id} institution={institution} />
        ))}
      </div>
    </div>
  );
};

export default TopInstitutions;
