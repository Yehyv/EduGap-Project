import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Filter,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentPctFilters {
  academicYear: string;
  planId: string;
  settlementStatus: string;
  page: number;
  limit: number;
}

interface PaymentPctRow {
  instituteId: number;
  instituteName: string;
  contractId: number;
  contractNo: string;
  academicYear: number;
  planId: number;
  planName: string;
  contractValue: number;
  collected: number;
  remaining: number;
  collectionPercentage: number;
  status: string;
}

interface PaymentPctResponse {
  filters: {
    academicYear: number | null;
    planId: number | null;
    settlementStatus: string | null;
  };
  summary: {
    totalContracts: number;
    averageCollectionPercentage: number;
    fullyPaidContracts: number;
    partiallyPaidContracts: number;
    notPaidOrOverdueContracts: number;
  };
  data: PaymentPctRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    count: number;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchPaymentPercentage(
  filters: PaymentPctFilters,
): Promise<PaymentPctResponse> {
  const params = new URLSearchParams();
  if (filters.academicYear) params.set("academicYear", filters.academicYear);
  if (filters.planId) params.set("planId", filters.planId);
  if (filters.settlementStatus)
    params.set("settlementStatus", filters.settlementStatus);
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  const res = await dashboardApi.get(
    `/billing-reports/payment-percentage?${params.toString()}`,
  );
  return res.data.data;
}

async function exportPaymentPercentage(
  filters: PaymentPctFilters,
): Promise<void> {
  const year = filters.academicYear || String(new Date().getFullYear());
  const params = new URLSearchParams();
  params.set("reportType", "PAYMENT_PERCENTAGE");
  params.set("format", "EXCEL");
  params.set("academicYear", year);
  params.set("fromDate", `${year}-01-01`);
  params.set("toDate", `${year}-12-31`);
  if (filters.planId) params.set("planId", filters.planId);

  const res = await dashboardApi.get(
    `/billing-reports/export?${params.toString()}`,
    { responseType: "blob" },
  );
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `payment-percentage-${year}.xlsx`;
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
  "h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { cls: string; label: string }> = {
  FULLY_PAID: {
    cls: "bg-green-50 text-green-600 border-green-200",
    label: "Fully Paid",
  },
  PARTIALLY_PAID: {
    cls: "bg-orange-50 text-orange-500 border-orange-200",
    label: "Partially Paid",
  },
  OVERDUE: { cls: "bg-red-50 text-red-500 border-red-200", label: "Overdue" },
  PENDING: {
    cls: "bg-amber-50 text-amber-600 border-amber-200",
    label: "Pending",
  },
  CLOSED: { cls: "bg-gray-100 text-gray-500 border-gray-200", label: "Closed" },
};

const StatusBadge = ({ status }: { status: string }) => {
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

// ─── Collection % bar cell ────────────────────────────────────────────────────

const CollectionPctCell = ({ pct }: { pct: number }) => {
  const color =
    pct >= 80
      ? "bg-green-500"
      : pct >= 50
        ? "bg-blue-500"
        : pct >= 25
          ? "bg-amber-400"
          : "bg-red-400";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-10 text-right">
        {pct}%
      </span>
    </div>
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

// ─── Options ──────────────────────────────────────────────────────────────────

const YEARS = ["2026", "2025", "2024", "2023", "2022"];

const PLAN_OPTIONS = [
  { value: "", label: "All Plans" },
  { value: "1", label: "Starter" },
  { value: "2", label: "Growth" },
  { value: "3", label: "Enterprise" },
  { value: "4", label: "Custom" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "FULLY_PAID", label: "Fully Paid" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "PENDING", label: "Pending" },
  { value: "CLOSED", label: "Closed" },
];

// ─── Columns ──────────────────────────────────────────────────────────────────

const buildColumns = (page: number, limit: number) => [
  {
    name: "#",
    width: "56px",
    cell: (_row: PaymentPctRow, idx: number) => (
      <span className="text-gray-400 text-xs font-medium">
        {(page - 1) * limit + idx + 1}
      </span>
    ),
  },
  {
    name: "Institution",
    selector: (row: PaymentPctRow) => row.instituteName,
    cell: (row: PaymentPctRow) => (
      <span className="font-medium text-gray-800 truncate max-w-[160px] block">
        {row.instituteName}
      </span>
    ),
    grow: 2,
  },
  {
    name: "Contract Value (EGP)",
    selector: (row: PaymentPctRow) => row.contractValue,
    cell: (row: PaymentPctRow) => (
      <span className="text-gray-700">{egp(row.contractValue)}</span>
    ),
    right: true,
  },
  {
    name: "Collected (EGP)",
    selector: (row: PaymentPctRow) => row.collected,
    cell: (row: PaymentPctRow) => (
      <span className="font-medium text-green-600">{egp(row.collected)}</span>
    ),
    right: true,
  },
  {
    name: "Remaining (EGP)",
    selector: (row: PaymentPctRow) => row.remaining,
    cell: (row: PaymentPctRow) => (
      <span className="font-medium text-red-400">{egp(row.remaining)}</span>
    ),
    right: true,
  },
  {
    name: "Collection %",
    selector: (row: PaymentPctRow) => row.collectionPercentage,
    cell: (row: PaymentPctRow) => (
      <CollectionPctCell pct={row.collectionPercentage} />
    ),
    minWidth: "160px",
  },
  {
    name: "Status",
    cell: (row: PaymentPctRow) => <StatusBadge status={row.status} />,
    center: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const PaymentPercentagePage = () => {
  const currentYear = String(new Date().getFullYear());

  const [academicYear, setAcademicYear] = useState(currentYear);
  const [planId, setPlanId] = useState("");
  const [settlementStatus, setSettlementStatus] = useState("");

  const [applied, setApplied] = useState<PaymentPctFilters>({
    academicYear: currentYear,
    planId: "",
    settlementStatus: "",
    page: 1,
    limit: 10,
  });

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["payment-percentage", applied],
    queryFn: () => fetchPaymentPercentage(applied),
    placeholderData: (prev) => prev,
  });

  const handleFilter = () =>
    setApplied({ academicYear, planId, settlementStatus, page: 1, limit: 10 });

  const handlePageChange = (page: number) =>
    setApplied((prev) => ({ ...prev, page }));

  const handlePerRowsChange = (limit: number, page: number) =>
    setApplied((prev) => ({ ...prev, limit, page }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportPaymentPercentage(applied);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  const summary = data?.summary;
  const columns = buildColumns(applied.page, applied.limit);

  return (
    <>
      <DashboardPageTitle text="Payment Percentage Report" />
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
          <span className="text-gray-600 font-medium">Payment Percentage</span>
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
            {isExporting ? "Exporting…" : "Export"}
          </button>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          {...fadeUp(0.06)}
          className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
        >
          <div className="flex flex-wrap items-end gap-3">
            {/* Year */}
            <div className="flex flex-col gap-1 min-w-[110px]">
              <label className="text-xs font-medium text-gray-500">Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
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

            {/* Settlement Status */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium text-gray-500">
                Status
              </label>
              <select
                value={settlementStatus}
                onChange={(e) => setSettlementStatus(e.target.value)}
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
              className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-70"
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
              {/* Average Collection % */}
              <motion.div
                {...fadeUp(0.1)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Average Collection %
                </p>
                <p className="text-3xl font-bold text-gray-800 leading-tight">
                  {summary.averageCollectionPercentage}%
                </p>
              </motion.div>

              {/* Fully Paid */}
              <motion.div
                {...fadeUp(0.14)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Fully Paid Contracts
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.fullyPaidContracts}
                    </p>
                    <p className="text-xs font-semibold text-green-500">
                      {summary.totalContracts > 0
                        ? `${Math.round((summary.fullyPaidContracts / summary.totalContracts) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Partially Paid */}
              <motion.div
                {...fadeUp(0.18)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Partially Paid Contracts
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.partiallyPaidContracts}
                    </p>
                    <p className="text-xs font-semibold text-orange-400">
                      {summary.totalContracts > 0
                        ? `${Math.round((summary.partiallyPaidContracts / summary.totalContracts) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Not Paid / Overdue */}
              <motion.div
                {...fadeUp(0.22)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <XCircle size={16} className="text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Not Paid / Overdue
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.notPaidOrOverdueContracts}
                    </p>
                    <p className="text-xs font-semibold text-red-400">
                      {summary.totalContracts > 0
                        ? `${Math.round((summary.notPaidOrOverdueContracts / summary.totalContracts) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
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
                Failed to load report data.
              </p>
            </div>
          ) : (
            <DataTable<PaymentPctRow>
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
                  <AlertCircle size={28} className="text-gray-200" />
                  <p className="text-sm text-gray-400">
                    No contracts found for the selected filters.
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

export default PaymentPercentagePage;
