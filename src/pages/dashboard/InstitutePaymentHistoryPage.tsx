import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  AlertCircle,
  FileX,
  Eye,
  CalendarDays,
  Filter,
  Loader2,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentFilters {
  academicYear: number;
  fromDate: string;
  toDate: string;
  status: string;
  page: number;
  limit: number;
}

interface PaymentRow {
  paymentId: number;
  paymentNo: string;
  installmentId: number;
  installmentNo: number;
  installmentLabel: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  method: string;
  receiptNo: string | null;
  status: string;
  createdAt: string;
}

interface PaymentsResponse {
  filters: {
    academicYear: number;
    fromDate: string;
    toDate: string;
    status: string;
  };
  summary: {
    totalPayments: number;
    totalPaid: number;
    remainingAmount: number;
  };
  data: PaymentRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    count: number;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchInstitutePayments(
  f: PaymentFilters,
): Promise<PaymentsResponse | null> {
  try {
    const params = new URLSearchParams();
    params.set("academicYear", String(f.academicYear));
    if (f.fromDate) params.set("fromDate", f.fromDate);
    if (f.toDate) params.set("toDate", f.toDate);
    if (f.status) params.set("status", f.status);
    params.set("page", String(f.page));
    params.set("limit", String(f.limit));

    const res = await dashboardApi.get(
      `/annual-settlements/institute/payments?${params.toString()}`,
    );
    return res.data.data ?? null;
  } catch (err: any) {
    const messages: string[] = err?.response?.data?.message ?? [];
    const isNoContract = messages.some((m: string) =>
      m.toLowerCase().includes("no active annual contract"),
    );
    if (isNoContract) return null;
    throw err;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fmtDate = (iso: string) => iso?.split("T")[0] ?? iso;

const yearStart = (y: number) => `${y}-01-01`;
const yearEnd = (y: number) => `${y}-12-31`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

const inputCls =
  "h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors";

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useLanguage();

  const STATUS_CFG: Record<string, { cls: string; label: string }> = {
    CONFIRMED: {
      cls: "bg-green-50 text-green-600 border-green-200",
      label: t("statusConfirmed"),
    },
    PENDING: {
      cls: "bg-amber-50 text-amber-600 border-amber-200",
      label: t("statusPending"),
    },
    REJECTED: {
      cls: "bg-red-50 text-red-500 border-red-200",
      label: t("statusRejected"),
    },
    CANCELLED: {
      cls: "bg-gray-100 text-gray-500 border-gray-200",
      label: t("statusCancelled"),
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

// ─── Year Dropdown ────────────────────────────────────────────────────────────

const YEARS = [2027, 2026, 2025, 2024, 2023, 2022];

const YearDropdown = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (y: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        {value}
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20"
          >
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  onChange(y);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                  y === value
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {y}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

// ─── No Contract ─────────────────────────────────────────────────────────────

const NoContractState = ({
  year,
  onChangeYear,
}: {
  year: number;
  onChangeYear: (y: number) => void;
}) => {
  const { t } = useLanguage();
  return (
    <motion.div
      {...fadeUp(0.05)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 gap-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
        <FileX size={28} className="text-gray-300" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold text-gray-700">
          {t("noPaymentsFoundPrefix")} {year}
        </p>
        <p className="text-xs text-gray-400 max-w-xs">
          {t("noActiveContractMsg")}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {YEARS.filter((y) => y !== year)
          .slice(0, 4)
          .map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => onChangeYear(y)}
              className="h-8 px-4 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t("tryYearPrefix")} {y}
            </button>
          ))}
      </div>
    </motion.div>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

const InstitutePaymentHistoryPage = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const METHOD_LABEL: Record<string, string> = {
    BANK_TRANSFER: t("paymentMethodBankTransfer"),
    CASH: t("paymentMethodCash"),
    CHEQUE: t("paymentMethodCheque"),
    ONLINE: t("paymentMethodOnline"),
  };

  const STATUS_OPTIONS = [
    { value: "", label: t("statusAll") },
    { value: "CONFIRMED", label: t("statusConfirmed") },
    { value: "PENDING", label: t("statusPending") },
    { value: "REJECTED", label: t("statusRejected") },
    { value: "CANCELLED", label: t("statusCancelled") },
  ];

  // Draft filter state
  const [academicYear, setAcademicYear] = useState(currentYear);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");

  // Applied (fires API)
  const [applied, setApplied] = useState<PaymentFilters>({
    academicYear: currentYear,
    fromDate: yearStart(currentYear),
    toDate: yearEnd(currentYear),
    status: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["institute-payments", applied],
    queryFn: () => fetchInstitutePayments(applied),
    placeholderData: (prev) => prev,
    retry: false,
  });

  const handleYearChange = (y: number) => {
    setAcademicYear(y);
  };

  const handleFilter = () => {
    setApplied({ academicYear, fromDate, toDate, status, page: 1, limit: 10 });
  };

  // ── Columns ──
  const columns = [
    {
      name: t("columnNumber"),
      width: "56px",
      cell: (_row: PaymentRow, idx: number) => (
        <span className="text-gray-400 text-xs font-medium">
          {(applied.page - 1) * applied.limit + idx + 1}
        </span>
      ),
    },
    {
      name: t("columnPaymentId"),
      selector: (row: PaymentRow) => row.paymentNo,
      cell: (row: PaymentRow) => (
        <span className="font-mono text-xs text-gray-600">{row.paymentNo}</span>
      ),
    },
    {
      name: t("columnInstallment"),
      selector: (row: PaymentRow) => row.installmentLabel,
      cell: (row: PaymentRow) => (
        <span className="font-medium text-gray-800">
          {row.installmentLabel}
        </span>
      ),
      grow: 1,
    },
    {
      name: t("columnPaymentDate"),
      selector: (row: PaymentRow) => row.paymentDate,
      cell: (row: PaymentRow) => (
        <span className="text-gray-600">{fmtDate(row.paymentDate)}</span>
      ),
    },
    {
      name: t("columnAmount"),
      selector: (row: PaymentRow) => row.amount,
      cell: (row: PaymentRow) => (
        <span className="font-semibold text-gray-800">{egp(row.amount)}</span>
      ),
      right: true,
    },
    {
      name: t("columnMethod"),
      selector: (row: PaymentRow) => row.paymentMethod,
      cell: (row: PaymentRow) => (
        <span className="text-gray-600">
          {METHOD_LABEL[row.paymentMethod] ?? row.paymentMethod}
        </span>
      ),
    },
    {
      name: t("columnReceiptNo"),
      selector: (row: PaymentRow) => row.receiptNo ?? "",
      cell: (row: PaymentRow) => (
        <span className="font-mono text-xs text-gray-500">
          {row.receiptNo ?? "—"}
        </span>
      ),
    },
    {
      name: t("columnStatus"),
      center: true,
      cell: (row: PaymentRow) => <StatusBadge status={row.status} />,
    },
    {
      name: t("columnAction"),
      center: true,
      cell: (row: PaymentRow) => (
        <Link
          to={`/dashboard/payments-history/invoice/${row.installmentId}`}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-colors"
          title={t("viewDetailsTooltip")}
        >
          <Eye size={14} />
        </Link>
      ),
    },
  ];

  const summary = data?.summary;

  return (
    <>
      <DashboardPageTitle text={t("paymentHistoryPageTitle")} />
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
              {t("dashboardBreadcrumb")}
            </Link>
            <ChevronRight size={13} />
            <span className="text-gray-600 font-medium">
              {t("paymentsBreadcrumb")}
            </span>
          </nav>
          <YearDropdown value={academicYear} onChange={handleYearChange} />
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          {...fadeUp(0.04)}
          className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
        >
          <div className="flex flex-wrap items-end gap-3">
            {/* From Date */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <CalendarDays size={11} /> {t("fromDateLabel")}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <CalendarDays size={11} /> {t("toDateLabel")}
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-medium text-gray-500">
                {t("statusLabel")}
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
              className="h-9 px-5 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isFetching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Filter size={14} />
              )}
              {t("filterLabel")}
            </button>
          </div>
        </motion.div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Sk key={i} className="h-20" />
              ))}
            </div>
            <Sk className="h-64" />
          </div>
        )}

        {/* ── Real error ── */}
        {isError && !isLoading && (
          <motion.div
            {...fadeUp(0.05)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3"
          >
            <AlertCircle size={32} className="text-red-300" />
            <p className="text-sm text-red-400">{t("somethingWentWrongMsg")}</p>
          </motion.div>
        )}

        {/* ── No contract ── */}
        {!isLoading && !isError && data === null && (
          <NoContractState
            year={academicYear}
            onChangeYear={(y) => {
              handleYearChange(y);
              setApplied((prev) => ({
                ...prev,
                academicYear: y,
                fromDate: yearStart(y),
                toDate: yearEnd(y),
                page: 1,
              }));
            }}
          />
        )}

        {/* ── Content ── */}
        {!isLoading && !isError && data && (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                {...fadeUp(0.08)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <p className="text-xs text-gray-400 font-medium mb-1">
                  {t("totalPaymentsLabel")}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {summary!.totalPayments}
                </p>
              </motion.div>

              <motion.div
                {...fadeUp(0.12)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <p className="text-xs text-gray-400 font-medium mb-1">
                  {t("totalPaidLabel")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {egp(summary!.totalPaid)}
                </p>
              </motion.div>

              <motion.div
                {...fadeUp(0.16)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <p className="text-xs text-gray-400 font-medium mb-1">
                  {t("remainingAmountLabel2")}
                </p>
                <p className="text-2xl font-bold text-red-400">
                  {egp(summary!.remainingAmount)}
                </p>
              </motion.div>
            </div>

            {/* ── DataTable ── */}
            <motion.div
              {...fadeUp(0.2)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <DataTable<PaymentRow>
                columns={columns}
                data={data.data}
                progressPending={isFetching && !data}
                progressComponent={
                  <div className="flex flex-col gap-3 p-5 w-full">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-gray-100 rounded-lg h-10 w-full"
                      />
                    ))}
                  </div>
                }
                noDataComponent={
                  <div className="flex flex-col items-center gap-2 py-14">
                    <FileX size={28} className="text-gray-200" />
                    <p className="text-sm text-gray-400">
                      {t("noPaymentsFound")}
                    </p>
                  </div>
                }
                pagination
                paginationServer
                paginationTotalRows={data.meta.total}
                paginationDefaultPage={applied.page}
                paginationPerPage={applied.limit}
                onChangePage={(p) =>
                  setApplied((prev) => ({ ...prev, page: p }))
                }
                onChangeRowsPerPage={(l, p) =>
                  setApplied((prev) => ({ ...prev, limit: l, page: p }))
                }
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
            </motion.div>
          </>
        )}
      </div>
    </>
  );
};

export default InstitutePaymentHistoryPage;
