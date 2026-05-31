import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  Clock,
  Percent,
  Filter,
  Download,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import { Link } from "react-router-dom";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── API ─────────────────────────────────────────────────────────────────────

interface YearlyFilters {
  academicYear: number;
  planId: string;
}

interface MonthData {
  monthNo: number;
  month: string;
  contractValue: number;
  collected: number;
}

interface PlanRevenue {
  planId: number;
  planName: string;
  revenue: number;
  percentage: number;
}

interface YearlySummary {
  totalRevenue: number;
  totalCollected: number;
  totalRemaining: number;
  collectionPercentage: number;
}

interface YearlyResponse {
  summary: YearlySummary;
  revenueOverview: MonthData[];
  revenueByPlan: PlanRevenue[];
}

async function fetchYearlyRevenue(
  filters: YearlyFilters,
): Promise<YearlyResponse> {
  const params: Record<string, string | number> = {
    academicYear: filters.academicYear,
  };
  if (filters.planId) params.planId = filters.planId;
  const res = await dashboardApi.get("/billing-reports/yearly-revenue", {
    params,
  });
  return res.data.data;
}

async function exportYearlyRevenue(filters: YearlyFilters): Promise<Blob> {
  const year = filters.academicYear;
  const params: Record<string, string | number> = {
    reportType: "YEARLY_REVENUE",
    format: "EXCEL",
    academicYear: year,
    fromDate: `${year}-01-01`,
    toDate: `${year}-12-31`,
  };
  if (filters.planId) params.planId = filters.planId;
  const res = await dashboardApi.get("/billing-reports/export", {
    params,
    responseType: "blob",
  });
  return res.data;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PLAN_OPTIONS = [
  { label: "All Plans", value: "" },
  { label: "Starter Plan", value: "1" },
  { label: "Growth Plan", value: "2" },
  { label: "Enterprise Plan", value: "3" },
  { label: "Custom Plan", value: "4" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i);

const PIE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const fmt = (n: number) =>
  n >= 1_000_000
    ? `EGP ${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `EGP ${(n / 1_000).toFixed(0)}K`
      : `EGP ${n.toLocaleString()}`;

const fmtFull = (n: number) =>
  `EGP ${n.toLocaleString("en-EG", { minimumFractionDigits: 0 })}`;

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── STAT CARD ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  index: number;
}

function StatCard({ label, value, icon, accent, index }: StatCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow duration-200"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 truncate">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-800 tracking-tight truncate">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ─── CUSTOM BAR TOOLTIP ───────────────────────────────────────────────────────

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ background: p.fill }}
          />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-700">
            {fmtFull(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── CUSTOM PIE TOOLTIP ───────────────────────────────────────────────────────

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{d.name}</p>
      <p className="text-slate-500">
        Revenue:{" "}
        <span className="font-semibold text-slate-700">{fmtFull(d.value)}</span>
      </p>
      <p className="text-slate-500">
        Share:{" "}
        <span className="font-semibold text-slate-700">
          {d.payload.percentage?.toFixed(1)}%
        </span>
      </p>
    </div>
  );
}

// ─── ACTIVE PIE SHAPE ─────────────────────────────────────────────────────────

function ActiveShape(props: any) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props;
  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="#1e293b"
        className="text-sm font-bold"
        fontSize={13}
        fontWeight={700}
      >
        {payload.planName}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize={12}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function YearlyRevenuePage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [planId, setPlanId] = useState("");
  const [activeFilters, setActiveFilters] = useState<YearlyFilters>({
    academicYear: CURRENT_YEAR,
    planId: "",
  });
  const [exporting, setExporting] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState(0);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["yearly-revenue", activeFilters],
    queryFn: () => fetchYearlyRevenue(activeFilters),
    placeholderData: (prev) => prev,
  });

  const applyFilters = useCallback(() => {
    setActiveFilters({ academicYear: year, planId });
  }, [year, planId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportYearlyRevenue(activeFilters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `yearly-revenue-${activeFilters.academicYear}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary;
  const overview = data?.revenueOverview ?? [];
  const byPlan = data?.revenueByPlan ?? [];

  const statCards = [
    {
      label: "Total Revenue",
      value: summary ? fmtFull(summary.totalRevenue) : "—",
      icon: <TrendingUp size={20} className="text-blue-600" />,
      accent: "bg-blue-50",
    },
    {
      label: "Total Collected",
      value: summary ? fmtFull(summary.totalCollected) : "—",
      icon: <Wallet size={20} className="text-emerald-600" />,
      accent: "bg-emerald-50",
    },
    {
      label: "Total Remaining",
      value: summary ? fmtFull(summary.totalRemaining) : "—",
      icon: <Clock size={20} className="text-amber-600" />,
      accent: "bg-amber-50",
    },
    {
      label: "Collection %",
      value: summary ? `${summary.collectionPercentage.toFixed(1)}%` : "—",
      icon: <Percent size={20} className="text-violet-600" />,
      accent: "bg-violet-50",
    },
  ];

  return (
    <>
      <DashboardPageTitle text="Yearly Revenue Report" />
      <div>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ── Breadcrumb ── */}
          <motion.nav
            {...fadeUp(0)}
            className="flex items-center gap-1.5 text-sm text-gray-400"
          >
            <Link
              to="/dashboard/home"
              className="hover:text-gray-600 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight size={13} />
            <span className="text-gray-600 font-medium">Reports</span>
            <ChevronRight size={13} />
            <span className="text-gray-600 font-medium">Yearly Revenue</span>
          </motion.nav>

          {/* Filter Bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-wrap items-end gap-3"
          >
            {/* Year */}
            <div className="flex flex-col gap-1 min-w-[120px]">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan */}
            <div className="flex flex-col gap-1 min-w-[160px] flex-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Plan
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              >
                {PLAN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={applyFilters}
              className="h-9 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Filter size={13} />
              Filter
            </button>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              {exporting ? "Exporting…" : "Export"}
            </button>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium"
              >
                Failed to load data. Please try again.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <StatCard key={card.label} {...card} index={i + 1} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            {/* Bar Chart — Revenue Overview */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5}
              className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
            >
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-800">
                  Revenue Overview (EGP)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monthly contract value vs collected
                </p>
              </div>

              {isFetching ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-slate-300" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={overview} barGap={4} barCategoryGap="30%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => fmt(v)}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Tooltip
                      content={<BarTooltip />}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                      formatter={(val) => (
                        <span className="text-slate-500 font-medium">
                          {val}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="contractValue"
                      name="Contract Value"
                      fill="#bfdbfe"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="collected"
                      name="Collected"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Pie Chart — Revenue by Plan */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={6}
              className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
            >
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-800">
                  Revenue by Plan
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribution across plans
                </p>
              </div>

              {isFetching ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-slate-300" />
                </div>
              ) : byPlan.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-300">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-100 flex items-center justify-center">
                    <TrendingUp size={28} className="text-slate-200" />
                  </div>
                  <p className="text-sm text-slate-400">
                    No plan data available
                  </p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        activeIndex={activePieIndex}
                        activeShape={ActiveShape}
                        data={byPlan}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        dataKey="revenue"
                        nameKey="planName"
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                      >
                        {byPlan.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="mt-3 space-y-2">
                    {byPlan.map((plan, i) => (
                      <div
                        key={plan.planId}
                        className="flex items-center justify-between text-sm cursor-pointer"
                        onMouseEnter={() => setActivePieIndex(i)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-slate-600 font-medium truncate max-w-[120px]">
                            {plan.planName}
                          </span>
                        </div>
                        <span className="text-slate-500 font-semibold text-xs tabular-nums">
                          {plan.percentage?.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
