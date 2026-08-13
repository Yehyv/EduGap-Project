import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  CalendarDays,
  Filter,
  Download,
  AlertCircle,
  Loader2,
  Clock,
  CalendarClock,
  TrendingUp,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpcomingFilters {
  dueFrom: string;
  dueTo: string;
  planId: string;
  page: number;
  limit: number;
}

interface UpcomingRow {
  instituteId: number;
  instituteName: string;
  contractId: number;
  contractNo: string;
  academicYear: number;
  planId: number;
  planName: string;
  installmentId: number;
  installmentNo: number;
  dueDate: string;
  installmentAmount: number;
  remainingAmount: number;
  daysLeft: number;
  status: string;
}

interface UpcomingResponse {
  filters: {
    dueFrom: string;
    dueTo: string;
    planId: number | null;
  };
  summary: {
    upcomingInstallments: number;
    totalDueAmount: number;
    next7Days: { count: number; amount: number };
    next30Days: { count: number; amount: number };
  };
  data: UpcomingRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    count: number;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchUpcomingPayments(
  filters: UpcomingFilters,
): Promise<UpcomingResponse> {
  const params = new URLSearchParams();
  params.set("dueFrom", filters.dueFrom);
  params.set("dueTo", filters.dueTo);
  if (filters.planId) params.set("planId", filters.planId);
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  const res = await dashboardApi.get(
    `/billing-reports/upcoming-payments?${params.toString()}`,
  );
  return res.data.data;
}

async function exportUpcomingPayments(filters: UpcomingFilters): Promise<void> {
  const currentYear = new Date(filters.dueFrom).getFullYear();
  const params = new URLSearchParams();
  params.set("reportType", "UPCOMING_PAYMENTS");
  params.set("format", "EXCEL");
  params.set("academicYear", String(currentYear));
  params.set("fromDate", `${currentYear}-01-01`);
  params.set("toDate", `${currentYear}-12-31`);
  if (filters.planId) params.set("planId", filters.planId);

  const res = await dashboardApi.get(
    `/billing-reports/export?${params.toString()}`,
    { responseType: "blob" },
  );
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `upcoming-payments-${currentYear}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fmtDate = (iso: string) => iso?.split("T")[0] ?? iso;

const today = () => new Date().toISOString().split("T")[0];
const nDaysFromToday = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

const inputCls =
  "h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors";

// ─── Status badge ─────────────────────────────────────────────────────────────

const DaysLeftBadge = ({
  daysLeft,
  t,
}: {
  daysLeft: number;
  t: (k: string) => string;
}) => {
  if (daysLeft <= 7)
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-red-50 text-red-500 border-red-200">
        {t("dueSoon")}
      </span>
    );
  if (daysLeft <= 30)
    return (
      <span className="inline-flex text-center items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-600 border-amber-200">
        {t("dueSoon")}
      </span>
    );
  return (
    <span className="inline-flex text-center items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-500 border-blue-200">
      {t("upcoming")}
    </span>
  );
};

// ─── DataTable styles ─────────────────────────────────────────────────────────

const customStyles = {
  headRow: {
    style: {
      backgroundColor: "#f9fafb",
      borderBottom: "1px solid #f3f4f6",
      minHeight: "44px",
    },
  },
  headCells: {
    style: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#9ca3af",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      paddingLeft: "20px",
      paddingRight: "20px",
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      color: "#374151",
      borderBottom: "1px solid #f9fafb",
      minHeight: "52px",
      "&:hover": { backgroundColor: "#f9fafb" },
    },
  },
  cells: {
    style: { paddingLeft: "20px", paddingRight: "20px" },
  },
  pagination: {
    style: {
      borderTop: "1px solid #f3f4f6",
      fontSize: "12px",
      color: "#6b7280",
      minHeight: "52px",
    },
    pageButtonsStyle: {
      borderRadius: "8px",
      color: "#6b7280",
      fill: "#6b7280",
      "&:hover:not(:disabled)": { backgroundColor: "#f3f4f6" },
      "&:focus": { outline: "none", backgroundColor: "#eff6ff" },
    },
  },
  noData: {
    style: { padding: "48px 0", color: "#9ca3af", fontSize: "13px" },
  },
};

// ─── Columns ──────────────────────────────────────────────────────────────────

const buildColumns = (
  page: number,
  limit: number,
  t: (k: string) => string,
) => [
  {
    name: "#",
    width: "56px",
    cell: (_row: UpcomingRow, idx: number) => (
      <span className="text-gray-400 text-xs font-medium">
        {(page - 1) * limit + idx + 1}
      </span>
    ),
  },
  {
    name: t("institution"),
    selector: (row: UpcomingRow) => row.instituteName,
    cell: (row: UpcomingRow) => (
      <span className="font-medium text-gray-800 truncate max-w-[160px] block">
        {row.instituteName}
      </span>
    ),
    grow: 2,
  },
  {
    name: t("contractNo"),
    selector: (row: UpcomingRow) => row.contractNo,
    cell: (row: UpcomingRow) => (
      <span className="font-mono text-xs text-gray-500">{row.contractNo}</span>
    ),
  },
  {
    name: t("installmentNoDot"),
    selector: (row: UpcomingRow) => row.installmentNo,
    cell: (row: UpcomingRow) => (
      <span className="text-gray-700">{row.installmentNo}</span>
    ),
    center: true,
  },
  {
    name: t("dueDate"),
    selector: (row: UpcomingRow) => row.dueDate,
    cell: (row: UpcomingRow) => (
      <span className="text-gray-600">{fmtDate(row.dueDate)}</span>
    ),
  },
  {
    name: t("installmentAmountEgp"),
    selector: (row: UpcomingRow) => row.installmentAmount,
    cell: (row: UpcomingRow) => (
      <span className="font-semibold text-gray-800">
        {egp(row.installmentAmount)}
      </span>
    ),
    right: true,
  },
  {
    name: t("daysLeft"),
    selector: (row: UpcomingRow) => row.daysLeft,
    cell: (row: UpcomingRow) => (
      <span
        className={`font-semibold ${
          row.daysLeft <= 7
            ? "text-red-500"
            : row.daysLeft <= 30
              ? "text-amber-500"
              : "text-gray-700"
        }`}
      >
        {row.daysLeft}
      </span>
    ),
    center: true,
  },
  {
    name: t("status"),
    cell: (row: UpcomingRow) => <DaysLeftBadge daysLeft={row.daysLeft} t={t} />,
    center: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const UpcomingPaymentsPage = () => {
  const { t } = useLanguage();

  const PLAN_OPTIONS = [
    { value: "", label: t("allPlans") },
    { value: "1", label: t("starter") },
    { value: "2", label: t("growth") },
    { value: "3", label: t("enterprise") },
    { value: "4", label: t("custom") },
  ];

  const [dueFrom, setDueFrom] = useState(today());
  const [dueTo, setDueTo] = useState(nDaysFromToday(365));
  const [planId, setPlanId] = useState("");

  const [applied, setApplied] = useState<UpcomingFilters>({
    dueFrom: today(),
    dueTo: nDaysFromToday(365),
    planId: "",
    page: 1,
    limit: 10,
  });

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["upcoming-payments", applied],
    queryFn: () => fetchUpcomingPayments(applied),
    placeholderData: (prev) => prev,
  });

  const handleFilter = () =>
    setApplied({ dueFrom, dueTo, planId, page: 1, limit: 10 });

  const handlePageChange = (page: number) =>
    setApplied((prev) => ({ ...prev, page }));

  const handlePerRowsChange = (limit: number, page: number) =>
    setApplied((prev) => ({ ...prev, limit, page }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportUpcomingPayments(applied);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  const summary = data?.summary;
  const columns = buildColumns(applied.page, applied.limit, t);

  return (
    <>
      <DashboardPageTitle text={t("upcomingPaymentsReport")} />

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
            {t("dashboard")}
          </Link>
          <ChevronRight size={13} />
          <span className="text-gray-600 font-medium">{t("reports")}</span>

          <ChevronRight size={13} />
          <span className="text-gray-600 font-medium">{t("upcoming")}</span>
        </motion.nav>

        {/* ── Export ── */}
        <motion.div {...fadeUp(0.03)} className="flex justify-end -mt-2">
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
            {isExporting ? t("exporting") : t("export")}
          </button>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          {...fadeUp(0.06)}
          className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
        >
          <div className="flex flex-wrap items-end gap-3">
            {/* Due From */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <CalendarDays size={11} /> {t("dueFrom")}
              </label>
              <input
                type="date"
                value={dueFrom}
                onChange={(e) => setDueFrom(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Due To */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <CalendarDays size={11} /> {t("dueTo")}
              </label>
              <input
                type="date"
                value={dueTo}
                onChange={(e) => setDueTo(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Plan */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-medium text-gray-500">
                {t("plan")}
              </label>
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

            {/* Filter button */}
            <button
              type="button"
              onClick={handleFilter}
              disabled={isFetching}
              className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isFetching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Filter size={14} />
              )}
              {t("filter")}
            </button>
          </div>
        </motion.div>

        {/* ── KPI Cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 rounded-xl h-20"
              />
            ))}
          </div>
        ) : (
          summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Upcoming Installments */}
              <motion.div
                {...fadeUp(0.1)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <CalendarClock size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                    {t("upcomingInstallments")}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {summary.upcomingInstallments}
                  </p>
                </div>
              </motion.div>

              {/* Total Due Amount */}
              <motion.div
                {...fadeUp(0.14)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1">
                  <TrendingUp size={11} className="text-gray-400" />
                  {t("totalDueAmount")}
                </p>
                <p className="text-xl font-bold text-gray-800 leading-tight">
                  {egp(summary.totalDueAmount)}
                </p>
              </motion.div>

              {/* Next 7 Days */}
              <motion.div
                {...fadeUp(0.18)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                    {t("next7Days")}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {summary.next7Days.count}
                  </p>
                  <p className="text-xs text-gray-400">
                    {egp(summary.next7Days.amount)}
                  </p>
                </div>
              </motion.div>

              {/* Next 30 Days */}
              <motion.div
                {...fadeUp(0.22)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                    {t("next30Days")}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {summary.next30Days.count}
                  </p>
                  <p className="text-xs text-gray-400">
                    {egp(summary.next30Days.amount)}
                  </p>
                </div>
              </motion.div>
            </div>
          )
        )}

        {/* ── DataTable ── */}
        <motion.div
          {...fadeUp(0.26)}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <AlertCircle size={28} className="text-red-300" />
              <p className="text-sm text-red-400">
                {t("failedToLoadUpcomingPayments")}
              </p>
            </div>
          ) : (
            <DataTable<UpcomingRow>
              columns={columns}
              data={data?.data ?? []}
              progressPending={isLoading}
              progressComponent={
                <div className="flex flex-col gap-3 p-5 w-full">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-gray-100 rounded-lg h-10 w-full"
                    />
                  ))}
                </div>
              }
              noDataComponent={
                <div className="flex flex-col items-center gap-2 py-14">
                  <CalendarClock size={28} className="text-gray-200" />
                  <p className="text-sm text-gray-400">
                    {t("noUpcomingPaymentsFound")}
                  </p>
                </div>
              }
              pagination
              paginationServer
              paginationTotalRows={data?.meta.total ?? 0}
              paginationDefaultPage={applied.page}
              paginationPerPage={applied.limit}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              paginationRowsPerPageOptions={[10, 20, 50]}
              customStyles={customStyles}
              highlightOnHover
              responsive
              className={
                isFetching
                  ? "opacity-60 transition-opacity"
                  : "transition-opacity"
              }
            />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default UpcomingPaymentsPage;
