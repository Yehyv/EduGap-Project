import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ChevronRight,
  CalendarDays,
  Filter,
  Download,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollectionSummaryFilters {
  fromDate: string;
  toDate: string;
  academicYear: number | string;
  planId: string;
  status: string;
}

interface CollectionSummaryData {
  filters: {
    fromDate: string;
    toDate: string;
    academicYear: number;
    planId: number | null;
    status: string | null;
    settlementStatus: string | null;
  };
  summary: {
    totalContracts: number;
    totalContractValue: number;
    totalCollected: number;
    totalRemaining: number;
    collectedPercentage: number;
    remainingPercentage: number;
  };
  collectionOverview: {
    collected: { amount: number; percentage: number };
    remaining: { amount: number; percentage: number };
  };
  collectionTrend: {
    month: string;
    collected: number;
    remaining: number;
  }[];
  collectionByPlan: {
    planId: number;
    planName: string;
    contracts: number;
    contractValue: number;
    collected: number;
    remaining: number;
    collectionPercentage: number;
  }[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchCollectionSummary(
  filters: CollectionSummaryFilters,
): Promise<CollectionSummaryData> {
  const params = new URLSearchParams();
  if (filters.fromDate) params.set("fromDate", filters.fromDate);
  if (filters.toDate) params.set("toDate", filters.toDate);
  params.set("academicYear", String(filters.academicYear));
  if (filters.planId) params.set("planId", filters.planId);
  if (filters.status) params.set("status", filters.status);
  const res = await dashboardApi.get(
    `/billing-reports/collection-summary?${params.toString()}`,
  );
  return res.data.data;
}

async function exportCollectionSummary(
  filters: CollectionSummaryFilters,
): Promise<void> {
  const params = new URLSearchParams();
  params.set("reportType", "COLLECTION_SUMMARY");
  params.set("format", "EXCEL");
  params.set("academicYear", String(filters.academicYear));
  if (filters.fromDate) params.set("fromDate", filters.fromDate);
  if (filters.toDate) params.set("toDate", filters.toDate);
  if (filters.planId) params.set("planId", filters.planId);

  const res = await dashboardApi.get(
    `/billing-reports/export?${params.toString()}`,
    { responseType: "blob" },
  );

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `collection-summary-${filters.academicYear}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

const inputCls =
  "h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors";

const YEARS = [2026, 2025, 2024, 2023, 2022];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "CLOSED", label: "Closed" },
  { value: "PENDING", label: "Pending" },
];

// Plan options – you can extend or fetch dynamically
const PLAN_OPTIONS = [
  { value: "", label: "All Plans" },
  { value: "1", label: "Starter Plan" },
  { value: "2", label: "Growth Plan" },
  { value: "3", label: "Enterprise Plan" },
  { value: "4", label: "Custom Plan" },
];

const today = () => new Date().toISOString().split("T")[0];
const yearStart = (y: number) => `${y}-01-01`;
const yearEnd = (y: number) => `${y}-12-31`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard = ({
  label,
  value,
  sub,
  subColor,
  delay,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  delay: number;
}) => (
  <motion.div
    {...fadeUp(delay)}
    className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-1"
  >
    <p className="text-xs text-gray-400 font-medium">{label}</p>
    <p className="text-xl font-bold text-gray-800 tracking-tight leading-tight">
      {value}
    </p>
    {sub && (
      <p className={`text-xs font-semibold ${subColor ?? "text-gray-400"}`}>
        {sub}
      </p>
    )}
  </motion.div>
);

// ─── Custom Pie Tooltip ───────────────────────────────────────────────────────

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{payload[0].name}</p>
      <p className="text-gray-500">{egp(payload[0].value)}</p>
      <p className="text-gray-400">{payload[0].payload.percentage}%</p>
    </div>
  );
};

// ─── Bar Tooltip ──────────────────────────────────────────────────────────────

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {egp(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CollectionSummaryPage = () => {
  const currentYear = new Date().getFullYear();

  const [fromDate, setFromDate] = useState(yearStart(currentYear));
  const [toDate, setToDate] = useState(yearEnd(currentYear));
  const [academicYear, setAcademicYear] = useState<number>(currentYear);
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState("");

  // "applied" filters — only update on Filter click
  const [applied, setApplied] = useState<CollectionSummaryFilters>({
    fromDate: yearStart(currentYear),
    toDate: yearEnd(currentYear),
    academicYear: currentYear,
    planId: "",
    status: "",
  });

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["collection-summary", applied],
    queryFn: () => fetchCollectionSummary(applied),
  });

  const handleFilter = () => {
    setApplied({ fromDate, toDate, academicYear, planId, status });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCollectionSummary(applied);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Pie data
  const pieData =
    data &&
    (data.collectionOverview.collected.amount > 0 ||
      data.collectionOverview.remaining.amount > 0)
      ? [
          {
            name: "Collected",
            value: data.collectionOverview.collected.amount,
            percentage: data.collectionOverview.collected.percentage,
            color: "#22c55e",
          },
          {
            name: "Remaining",
            value: data.collectionOverview.remaining.amount,
            percentage: data.collectionOverview.remaining.percentage,
            color: "#ef4444",
          },
        ]
      : [];

  return (
    <>
      <DashboardPageTitle text="Collection Summary Report" />
      <div className="flex flex-col gap-5 pb-8">
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
          <span className="text-gray-600 font-medium">Collection Summary</span>
        </motion.nav>

        {/* ── Export button (top right) ── */}
        <motion.div
          {...fadeUp(0.03)}
          className="flex items-center justify-end -mt-2"
        >
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || isLoading}
            className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 size={14} className="animate-spin text-gray-400" />
            ) : (
              <Download size={14} className="text-gray-400" />
            )}
            {isExporting ? "Exporting…" : "Export"}
          </button>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          {...fadeUp(0.06)}
          className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
        >
          <div className="flex flex-wrap items-end gap-3">
            {/* From Date */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <CalendarDays size={11} />
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <CalendarDays size={11} />
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Year */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Year</label>
              <select
                value={academicYear}
                onChange={(e) => {
                  const y = Number(e.target.value);
                  setAcademicYear(y);
                }}
                className={`${inputCls} pr-8 appearance-none`}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-medium text-gray-500">Plan</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className={`${inputCls} pr-8 appearance-none`}
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-xs font-medium text-gray-500">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${inputCls} pr-8 appearance-none`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter button */}
            <button
              type="button"
              onClick={handleFilter}
              disabled={isFetching}
              className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isFetching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Filter size={14} />
              )}
              Filter
            </button>
          </div>
        </motion.div>

        {/* ── Loading skeleton ── */}
        {isLoading && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Sk key={i} className="h-20" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Sk className="h-60" />
              <Sk className="h-60" />
            </div>
            <Sk className="h-48" />
          </div>
        )}

        {/* ── Error ── */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <AlertCircle size={32} className="text-red-300" />
            <p className="text-sm text-red-400">Failed to load report data.</p>
          </div>
        )}

        {/* ── Content ── */}
        {data && !isLoading && (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                label="Total Contracts"
                value={data.summary.totalContracts}
                delay={0.1}
              />
              <SummaryCard
                label="Total Contract Value"
                value={egp(data.summary.totalContractValue)}
                delay={0.14}
              />
              <SummaryCard
                label="Total Collected"
                value={egp(data.summary.totalCollected)}
                sub={`${data.summary.collectedPercentage}%`}
                subColor="text-blue-500"
                delay={0.18}
              />
              <SummaryCard
                label="Total Remaining"
                value={egp(data.summary.totalRemaining)}
                sub={`${data.summary.remainingPercentage}%`}
                subColor="text-red-400"
                delay={0.22}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Collection Overview — Donut */}
              <motion.div
                {...fadeUp(0.26)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <TrendingUp size={13} className="text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    Collection Overview
                  </h3>
                </div>
                <div className="p-5 flex items-center gap-4">
                  {pieData.length > 0 ? (
                    <>
                      <div className="w-44 h-44 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={46}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {pieData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-3">
                        {pieData.map((entry) => (
                          <div
                            key={entry.name}
                            className="flex items-start gap-2"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0"
                              style={{ backgroundColor: entry.color }}
                            />
                            <div>
                              <p className="text-xs font-semibold text-gray-600">
                                {entry.name} ({entry.percentage}%)
                              </p>
                              <p className="text-sm font-bold text-gray-800">
                                {egp(entry.value)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
                      <TrendingUp size={28} className="text-gray-200" />
                      <p className="text-xs text-gray-400">
                        No collection data for this period.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Collection Trend — Bar */}
              <motion.div
                {...fadeUp(0.3)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <TrendingUp size={13} className="text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    Collection Trend (EGP)
                  </h3>
                </div>
                <div className="p-4">
                  {data.collectionTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={data.collectionTrend}
                        barSize={10}
                        barGap={2}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f3f4f6"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) =>
                            v >= 1_000_000
                              ? `${(v / 1_000_000).toFixed(1)}M`
                              : v >= 1000
                                ? `${(v / 1000).toFixed(0)}K`
                                : String(v)
                          }
                          width={45}
                        />
                        <Tooltip content={<BarTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        />
                        <Bar
                          dataKey="collected"
                          name="Collected"
                          fill="#22c55e"
                          radius={[3, 3, 0, 0]}
                        />
                        <Bar
                          dataKey="remaining"
                          name="Remaining"
                          fill="#ef4444"
                          radius={[3, 3, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                      <TrendingUp size={28} className="text-gray-200" />
                      <p className="text-xs text-gray-400">
                        No trend data for this period.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Collection by Plan */}
            <motion.div
              {...fadeUp(0.34)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <TrendingUp size={13} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-800">
                  Collection by Plan
                </h3>
              </div>
              {data.collectionByPlan.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <TrendingUp size={28} className="text-gray-200" />
                  <p className="text-xs text-gray-400">
                    No plan data available for this period.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {[
                          "Plan",
                          "Contracts",
                          "Contract Value",
                          "Collected",
                          "Remaining",
                          "Collection %",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.collectionByPlan.map((row, i) => (
                        <motion.tr
                          key={row.planId}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.36 + i * 0.05 }}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-medium text-gray-800">
                            {row.planName}
                          </td>
                          <td className="px-5 py-3.5 text-gray-600">
                            {row.contracts}
                          </td>
                          <td className="px-5 py-3.5 text-gray-700">
                            {egp(row.contractValue)}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-green-600">
                            {egp(row.collected)}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-red-400">
                            {egp(row.remaining)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.min(row.collectionPercentage, 100)}%`,
                                  }}
                                  transition={{
                                    delay: 0.4 + i * 0.05,
                                    duration: 0.5,
                                    ease: "easeOut",
                                  }}
                                  className="h-full bg-green-500 rounded-full"
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 w-9 text-right">
                                {row.collectionPercentage}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </>
  );
};

export default CollectionSummaryPage;
