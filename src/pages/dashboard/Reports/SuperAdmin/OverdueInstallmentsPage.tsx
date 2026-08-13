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
  FileWarning,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverdueFilters {
  asOfDate: string;
  planId: string;
  overdueDays: string;
  page: number;
  limit: number;
}

interface OverdueRow {
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
  overdueDays: number;
  overdueAmount: number;
  status: string;
}

interface OverdueResponse {
  filters: {
    asOfDate: string;
    planId: number | null;
    overdueDays: number | null;
  };
  summary: {
    overdueContracts: number;
    overdueInstallments: number;
    totalOverdueAmount: number;
  };
  data: OverdueRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    count: number;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchOverdueInstallments(
  filters: OverdueFilters,
): Promise<OverdueResponse> {
  const params = new URLSearchParams();
  params.set("asOfDate", filters.asOfDate);
  if (filters.planId) params.set("planId", filters.planId);
  if (filters.overdueDays) params.set("overdueDays", filters.overdueDays);
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  const res = await dashboardApi.get(
    `/billing-reports/overdue-installments?${params.toString()}`,
  );
  return res.data.data;
}

async function exportOverdueInstallments(
  filters: OverdueFilters,
): Promise<void> {
  const currentYear = new Date(filters.asOfDate).getFullYear();
  const params = new URLSearchParams();
  params.set("reportType", "OVERDUE_INSTALLMENTS");
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
  a.download = `overdue-installments-${currentYear}.xlsx`;
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

const inputCls =
  "h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors";

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({
  status,
  t,
}: {
  status: string;
  t: (k: string) => string;
}) => {
  const STATUS_CFG: Record<string, { cls: string; label: string }> = {
    OVERDUE: {
      cls: "bg-red-50 text-red-500 border-red-200",
      label: t("overdue"),
    },
    PENDING: {
      cls: "bg-amber-50 text-amber-600 border-amber-200",
      label: t("pending"),
    },
    PARTIAL: {
      cls: "bg-blue-50 text-blue-500 border-blue-200",
      label: t("partial"),
    },
    PAID: {
      cls: "bg-green-50 text-green-600 border-green-200",
      label: t("paid"),
    },
  };
  const cfg = STATUS_CFG[status] ?? {
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
};

// ─── DataTable custom styles ──────────────────────────────────────────────────

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
    style: {
      paddingLeft: "20px",
      paddingRight: "20px",
    },
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
): TableColumn<OverdueRow>[] => [
  {
    name: "#",
    width: "56px",
    cell: (_row, idx) => (
      <span className="text-gray-400 text-xs font-medium">
        {(page - 1) * limit + idx + 1}
      </span>
    ),
  },
  {
    name: t("institution"),
    selector: (row) => row.instituteName,
    cell: (row) => (
      <span className="font-medium text-gray-800 truncate max-w-[160px] block">
        {row.instituteName}
      </span>
    ),
    grow: 2,
  },
  {
    name: t("contractNo"),
    selector: (row) => row.contractNo,
    cell: (row) => (
      <span className="font-mono text-xs text-gray-500">{row.contractNo}</span>
    ),
  },
  {
    name: t("installmentNoDot"),
    selector: (row) => row.installmentNo,
    cell: (row) => <span className="text-gray-700">{row.installmentNo}</span>,
    center: true,
  },
  {
    name: t("dueDate"),
    selector: (row) => row.dueDate,
    cell: (row) => (
      <span className="text-gray-600">{fmtDate(row.dueDate)}</span>
    ),
  },
  {
    name: t("overdueDays"),
    selector: (row) => row.overdueDays,
    cell: (row) => (
      <span
        className={`font-semibold ${
          row.overdueDays > 90
            ? "text-red-500"
            : row.overdueDays > 30
              ? "text-amber-500"
              : "text-gray-700"
        }`}
      >
        {row.overdueDays}
      </span>
    ),
    center: true,
  },
  {
    name: t("overdueAmountEgp"),
    selector: (row) => row.overdueAmount,
    cell: (row) => (
      <span className="font-semibold text-gray-800">
        {egp(row.overdueAmount)}
      </span>
    ),
    right: true,
  },
  {
    name: t("status"),
    cell: (row) => <StatusBadge status={row.status} t={t} />,
    center: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const OverdueInstallmentsPage = () => {
  const { t } = useLanguage();

  const PLAN_OPTIONS = [
    { value: "", label: t("allPlans") },
    { value: "1", label: t("starter") },
    { value: "2", label: t("growth") },
    { value: "3", label: t("enterprise") },
    { value: "4", label: t("custom") },
  ];

  const OVERDUE_DAYS_OPTIONS = [
    { value: "", label: t("all") },
    { value: "30", label: `30+ ${t("daysLower")}` },
    { value: "60", label: `60+ ${t("daysLower")}` },
    { value: "90", label: `90+ ${t("daysLower")}` },
    { value: "120", label: `120+ ${t("daysLower")}` },
  ];

  const [asOfDate, setAsOfDate] = useState(today());
  const [planId, setPlanId] = useState("");
  const [overdueDays, setOverdueDays] = useState("");

  const [applied, setApplied] = useState<OverdueFilters>({
    asOfDate: today(),
    planId: "",
    overdueDays: "",
    page: 1,
    limit: 10,
  });

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["overdue-installments", applied],
    queryFn: () => fetchOverdueInstallments(applied),
    placeholderData: (prev) => prev,
  });

  const handleFilter = () =>
    setApplied({ asOfDate, planId, overdueDays, page: 1, limit: 10 });

  const handlePageChange = (page: number) =>
    setApplied((prev) => ({ ...prev, page }));

  const handlePerRowsChange = (limit: number, page: number) =>
    setApplied((prev) => ({ ...prev, limit, page }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportOverdueInstallments(applied);
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
      <DashboardPageTitle text={t("overdueInstallmentsReport")} />
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
          <span className="text-gray-600 font-medium">{t("overdue")}</span>
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
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <CalendarDays size={11} /> {t("asOfDate")}
              </label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className={inputCls}
              />
            </div>

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

            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-medium text-gray-500">
                {t("overdueDays")}
              </label>
              <select
                value={overdueDays}
                onChange={(e) => setOverdueDays(e.target.value)}
                className={`${inputCls} pr-8 appearance-none`}
              >
                {OVERDUE_DAYS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

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
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 rounded-xl h-20"
              />
            ))}
          </div>
        ) : (
          summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                {...fadeUp(0.1)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <FileWarning size={16} className="text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                    {t("overdueContracts")}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {summary.overdueContracts}
                  </p>
                </div>
              </motion.div>

              <motion.div
                {...fadeUp(0.14)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                    {t("overdueInstallments")}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {summary.overdueInstallments}
                  </p>
                </div>
              </motion.div>

              <motion.div
                {...fadeUp(0.18)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <p className="text-xs text-gray-400 font-medium mb-1">
                  {t("totalOverdueAmount")}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {egp(summary.totalOverdueAmount)}
                </p>
              </motion.div>
            </div>
          )
        )}

        {/* ── DataTable ── */}
        <motion.div
          {...fadeUp(0.22)}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <AlertCircle size={28} className="text-red-300" />
              <p className="text-sm text-red-400">
                {t("failedToLoadOverdueData")}
              </p>
            </div>
          ) : (
            <DataTable<OverdueRow>
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
                  <FileWarning size={28} className="text-gray-200" />
                  <p className="text-sm text-gray-400">
                    {t("noOverdueInstallmentsFound")}
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

export default OverdueInstallmentsPage;
