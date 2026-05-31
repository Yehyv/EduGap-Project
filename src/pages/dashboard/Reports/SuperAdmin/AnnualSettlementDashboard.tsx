import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChevronRight,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MinusCircle,
  ArrowRight,
  Building2,
} from "lucide-react";
import { fetchAnnualSettlementDashboard } from "@/features/Dashboard/services/dashboardApis";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  FULLY_PAID: {
    label: "Fully Paid",
    color: "#22c55e",
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    dot: "bg-green-500",
    Icon: CheckCircle2,
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    color: "#f59e0b",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    dot: "bg-amber-400",
    Icon: Clock,
  },
  OVERDUE: {
    label: "Overdue",
    color: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-500",
    border: "border-red-200",
    dot: "bg-red-500",
    Icon: AlertCircle,
  },
  PENDING: {
    label: "Not Due",
    color: "#6b7280",
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-200",
    dot: "bg-gray-400",
    Icon: MinusCircle,
  },
  CLOSED: {
    label: "Closed",
    color: "#3b82f6",
    bg: "bg-blue-50",
    text: "text-blue-500",
    border: "border-blue-200",
    dot: "bg-blue-400",
    Icon: XCircle,
  },
};

const getCfg = (status) =>
  STATUS_CFG[status] ?? {
    label: status,
    color: "#9ca3af",
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-200",
    dot: "bg-gray-400",
    Icon: MinusCircle,
  };

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard = ({ label, value, sub, subColor, delay }) => (
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

// ─── Overview Card ────────────────────────────────────────────────────────────

const OverviewCard = ({ status, count, percentage, delay }) => {
  const cfg = getCfg(status);
  return (
    <motion.div
      {...fadeUp(delay)}
      className={`rounded-xl border ${cfg.border} ${cfg.bg} px-5 py-4 flex flex-col gap-2`}
    >
      <div className="flex items-center gap-2">
        <cfg.Icon size={14} className={cfg.text} />
        <p className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-800">{count}</p>
      <p className={`text-xs font-medium ${cfg.text}`}>{percentage}%</p>
    </motion.div>
  );
};

// ─── Custom Pie Legend ────────────────────────────────────────────────────────

const CustomLegend = ({ data }) => (
  <div className="flex flex-col gap-2 mt-2">
    {data.map((entry) => (
      <div
        key={entry.status}
        className="flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600">{entry.label}</span>
        </div>
        <span className="text-xs font-semibold text-gray-700">
          {entry.count} ({entry.percentage}%)
        </span>
      </div>
    ))}
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

// ─── Year Selector ────────────────────────────────────────────────────────────

const YEARS = [2026, 2025, 2024, 2023, 2022];

// ─── Main Component ───────────────────────────────────────────────────────────

const AnnualSettlementDashboard = () => {
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["annual-settlement-dashboard", academicYear],
    queryFn: () => fetchAnnualSettlementDashboard(academicYear),
  });

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-32" />
        <div className="grid grid-cols-2 gap-5">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle size={36} className="text-red-300" />
        <p className="text-sm text-red-400">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { summary, overview, settlementByStatus, topOverdueInstitutions } =
    data;

  // Build pie data (filter out 0-count entries for cleaner chart)
  const pieData = settlementByStatus
    .filter((s) => s.count > 0)
    .map((s) => ({
      ...s,
      color: getCfg(s.status).color,
    }));

  // Overview order matches screenshot
  const overviewOrder = ["FULLY_PAID", "PARTIALLY_PAID", "OVERDUE", "PENDING"];

  return (
    <>
      <DashboardPageTitle text="Annual Settlements Dashboard" />

      <div className="flex flex-col gap-5 pb-8">
        {/* ── Breadcrumb + Year ── */}
        <motion.div
          {...fadeUp(0)}
          className="flex items-center justify-between"
        >
          <nav className="flex items-center gap-1.5 text-sm text-gray-400">
            <Link
              to="/dashboard/home"
              className="hover:text-gray-600 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight size={13} />
            <div className="text-gray-600 ">Reports</div>
            <ChevronRight size={13} />
            <span className="text-gray-600 font-medium">Annual Settlement</span>
          </nav>

          {/* Year selector */}
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(Number(e.target.value))}
            className="h-9 px-3 pr-8 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors appearance-none cursor-pointer"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </motion.div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Contracts"
            value={summary.totalContracts}
            delay={0.05}
          />
          <SummaryCard
            label="Total Contract Value"
            value={egp(summary.totalContractValue)}
            delay={0.1}
          />
          <SummaryCard
            label="Total Collected"
            value={egp(summary.totalCollected)}
            sub={`${summary.collectedPercentage}%`}
            subColor="text-blue-500"
            delay={0.15}
          />
          <SummaryCard
            label="Total Remaining"
            value={egp(summary.totalRemaining)}
            sub={`${summary.remainingPercentage}%`}
            subColor="text-red-400"
            delay={0.2}
          />
        </div>

        {/* ── Settlement Overview ── */}
        <motion.div
          {...fadeUp(0.25)}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <FileText size={14} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">
              Settlement Overview
            </h3>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {overviewOrder.map((status, i) => {
              const key =
                status === "PENDING"
                  ? "pending"
                  : status.toLowerCase().replace("_", "");
              // map status key to overview object key
              const overviewKeyMap = {
                FULLY_PAID: "fullyPaid",
                PARTIALLY_PAID: "partiallyPaid",
                OVERDUE: "overdue",
                PENDING: "pending",
              };
              const oKey = overviewKeyMap[status];
              const item = overview[oKey] ?? { count: 0, percentage: 0 };
              return (
                <OverviewCard
                  key={status}
                  status={status}
                  count={item.count}
                  percentage={item.percentage}
                  delay={0.28 + i * 0.05}
                />
              );
            })}
          </div>
        </motion.div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Settlement by Status — Donut Chart */}
          <motion.div
            {...fadeUp(0.35)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <TrendingUp size={14} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-800">
                Settlement by Status
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
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="count"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={entry.status} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value} (${props.payload.percentage}%)`,
                            props.payload.label,
                          ]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CustomLegend data={pieData} />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
                  <MinusCircle size={28} className="text-gray-200" />
                  <p className="text-xs text-gray-400">No data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Overdue Institutions */}
          <motion.div
            {...fadeUp(0.4)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-red-400" />
                <h3 className="text-sm font-semibold text-gray-800">
                  Top Overdue Institutions
                </h3>
              </div>
            </div>

            <div className="divide-y divide-gray-50 max-h-[220px] overflow-y-auto">
              {/* Header row */}
              <div className="grid grid-cols-2 px-5 py-2.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Institution
                </p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
                  Overdue Amount
                </p>
              </div>

              {topOverdueInstitutions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <CheckCircle2 size={28} className="text-green-200" />
                  <p className="text-xs text-gray-400">
                    No overdue institutions
                  </p>
                </div>
              ) : (
                topOverdueInstitutions.map((inst, i) => (
                  <motion.div
                    key={inst.contractId}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.06 }}
                    className="grid grid-cols-2 items-center px-5 py-3 hover:bg-gray-50/60 transition-colors"
                  >
                    <Link
                      to={`/dashboard/reports/settlements/${inst.contractId}`}
                      className="flex items-center gap-2 min-w-0"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                        <Building2 size={11} className="text-red-400" />
                      </div>
                      <p className="text-sm text-gray-700 font-medium truncate">
                        {inst.instituteName}
                      </p>
                    </Link>
                    <p className="text-sm font-semibold text-red-500 text-right">
                      {egp(inst.overdueAmount)}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AnnualSettlementDashboard;
