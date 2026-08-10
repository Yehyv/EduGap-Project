import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/shared/localization/useLanguage";
import { fetchTopContentCategories } from "../services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  categoryId: number;
  categoryName: string;
  studentsCount: number;
  enrollmentsCount: number;
  contentsCount: number;
}

interface TopContentCategoriesResponse {
  status: number;
  message: string;
  data: {
    categories: Category[];
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#1e293b"];

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
  t,
}: any & { t: (key: string) => string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-md">
      <span className="text-sm font-semibold text-blue-700">
        {payload[0].name} : {payload[0].value} {t("enrollments")}
      </span>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ChartSkeleton = () => (
  <div className="flex flex-col items-center gap-4 animate-pulse">
    <div className="w-[220px] h-[220px] rounded-full bg-gray-100 relative">
      <div className="absolute inset-[35px] rounded-full bg-white" />
    </div>
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const TopContentCategories = () => {
  const { t } = useLanguage();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["top-content-categories"],
    queryFn: fetchTopContentCategories,
  });

  const categories = data?.data?.categories ?? [];

  const chartData = categories.map((cat) => ({
    name: cat.categoryName,
    value: cat.enrollmentsCount,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-custom overflow-hidden p-5">
      {/* Header */}
      <h5 className="text-lg font-semibold text-gray-900 mb-0.5">
        {t("topContentCategories")}
      </h5>
      <p className="text-sm text-gray-400 mb-4">
        {t("topContentCategoriesSubtitle")} {isLoading ? "..." : total}
      </p>

      {/* States */}
      {isLoading ? (
        <ChartSkeleton />
      ) : isError ? (
        <div className="flex items-center justify-center h-[260px]">
          <p className="text-sm text-red-400">{t("failedToLoadCategories")}</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[260px]">
          <p className="text-sm text-gray-400">{t("noCategoriesAvailable")}</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={120}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip t={t} />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-2">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TopContentCategories;
