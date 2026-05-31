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
  Tag,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscountTaxFilters {
  fromDate: string;
  toDate: string;
  planId: string;
  page: number;
  limit: number;
}

interface DiscountTaxRow {
  planId: number;
  planName: string;
  contracts: number;
  contractValue: number;
  discountAmount: number;
  discountPercentage: number;
  taxAmount: number;
  amountAfterDiscount: number;
  amountAfterTax: number;
}

interface DiscountTaxResponse {
  filters: {
    fromDate: string;
    toDate: string;
    planId: number | null;
  };
  summary: {
    totalDiscounts: number;
    totalTaxAmount: number;
    totalAmountAfterDiscount: number;
    totalAmountAfterTax: number;
  };
  data: DiscountTaxRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    count: number;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchDiscountTax(
  filters: DiscountTaxFilters,
): Promise<DiscountTaxResponse> {
  const params = new URLSearchParams();
  params.set("fromDate", filters.fromDate);
  params.set("toDate", filters.toDate);
  if (filters.planId) params.set("planId", filters.planId);
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  const res = await dashboardApi.get(
    `/billing-reports/discount-tax?${params.toString()}`,
  );
  return res.data.data;
}

async function exportDiscountTax(filters: DiscountTaxFilters): Promise<void> {
  const year = filters.fromDate.slice(0, 4);
  const params = new URLSearchParams();
  params.set("reportType", "DISCOUNT_TAX");
  params.set("format", "EXCEL");
  params.set("academicYear", year);
  params.set("fromDate", filters.fromDate);
  params.set("toDate", filters.toDate);
  if (filters.planId) params.set("planId", filters.planId);

  const res = await dashboardApi.get(
    `/billing-reports/export?${params.toString()}`,
    { responseType: "blob" },
  );
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `discount-tax-${year}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const yearStart = () => `${new Date().getFullYear()}-01-01`;
const yearEnd = () => `${new Date().getFullYear()}-12-31`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

const inputCls =
  "h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors";

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

const PLAN_OPTIONS = [
  { value: "", label: "All Plans" },
  { value: "1", label: "Starter" },
  { value: "2", label: "Growth" },
  { value: "3", label: "Enterprise" },
  { value: "4", label: "Custom" },
];

// ─── Columns ──────────────────────────────────────────────────────────────────

const buildColumns = (page: number, limit: number) => [
  {
    name: "#",
    width: "56px",
    cell: (_row: DiscountTaxRow, idx: number) => (
      <span className="text-gray-400 text-xs font-medium">
        {(page - 1) * limit + idx + 1}
      </span>
    ),
  },
  {
    name: "Plan",
    selector: (row: DiscountTaxRow) => row.planName,
    cell: (row: DiscountTaxRow) => (
      <span className="font-medium text-gray-800">{row.planName}</span>
    ),
    grow: 1,
  },
  {
    name: "Contract Value (EGP)",
    selector: (row: DiscountTaxRow) => row.contractValue,
    cell: (row: DiscountTaxRow) => (
      <span className="text-gray-700">{egp(row.contractValue)}</span>
    ),
    right: true,
  },
  {
    name: "Discount (EGP)",
    selector: (row: DiscountTaxRow) => row.discountAmount,
    cell: (row: DiscountTaxRow) => (
      <span className="font-medium text-blue-600">
        {egp(row.discountAmount)}
      </span>
    ),
    right: true,
  },
  {
    name: "Discount %",
    selector: (row: DiscountTaxRow) => row.discountPercentage,
    cell: (row: DiscountTaxRow) => (
      <span className="text-gray-600">
        {row.discountPercentage > 0 ? `${row.discountPercentage}%` : "—"}
      </span>
    ),
    center: true,
  },
  {
    name: "Tax (14%) (EGP)",
    selector: (row: DiscountTaxRow) => row.taxAmount,
    cell: (row: DiscountTaxRow) => (
      <span className="text-gray-700">{egp(row.taxAmount)}</span>
    ),
    right: true,
  },
  {
    name: "After Discount (EGP)",
    selector: (row: DiscountTaxRow) => row.amountAfterDiscount,
    cell: (row: DiscountTaxRow) => (
      <span className="font-medium text-gray-800">
        {egp(row.amountAfterDiscount)}
      </span>
    ),
    right: true,
  },
  {
    name: "After Tax (EGP)",
    selector: (row: DiscountTaxRow) => row.amountAfterTax,
    cell: (row: DiscountTaxRow) => (
      <span className="font-semibold text-gray-800">
        {egp(row.amountAfterTax)}
      </span>
    ),
    right: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const DiscountTaxPage = () => {
  const [fromDate, setFromDate] = useState(yearStart());
  const [toDate, setToDate] = useState(yearEnd());
  const [planId, setPlanId] = useState("");

  const [applied, setApplied] = useState<DiscountTaxFilters>({
    fromDate: yearStart(),
    toDate: yearEnd(),
    planId: "",
    page: 1,
    limit: 10,
  });

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["discount-tax", applied],
    queryFn: () => fetchDiscountTax(applied),
    placeholderData: (prev) => prev,
  });

  const handleFilter = () =>
    setApplied({ fromDate, toDate, planId, page: 1, limit: 10 });

  const handlePageChange = (page: number) =>
    setApplied((prev) => ({ ...prev, page }));

  const handlePerRowsChange = (limit: number, page: number) =>
    setApplied((prev) => ({ ...prev, limit, page }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDiscountTax(applied);
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
      <DashboardPageTitle text="Discount & Tax Report" />
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
          <span className="text-gray-600 font-medium">Discounts & Taxes</span>
        </motion.nav>

        {/* ── Filters + Export row ── */}
        <motion.div
          {...fadeUp(0.04)}
          className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            {/* Left: filters */}
            <div className="flex flex-wrap items-end gap-3">
              {/* From Date */}
              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <CalendarDays size={11} /> From Date
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
                  <CalendarDays size={11} /> To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Plan */}
              <div className="flex flex-col gap-1 min-w-[140px]">
                <label className="text-xs font-medium text-gray-500">
                  Plan
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
                Filter
              </button>
            </div>

            {/* Right: Export */}
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
              <motion.div
                {...fadeUp(0.1)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag size={12} className="text-blue-400" />
                  <p className="text-xs text-gray-400 font-medium">
                    Total Discounts
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-800">
                  {egp(summary.totalDiscounts)}
                </p>
              </motion.div>

              <motion.div
                {...fadeUp(0.14)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Receipt size={12} className="text-amber-400" />
                  <p className="text-xs text-gray-400 font-medium">
                    Total Tax Amount
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-800">
                  {egp(summary.totalTaxAmount)}
                </p>
              </motion.div>

              <motion.div
                {...fadeUp(0.18)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={12} className="text-green-400" />
                  <p className="text-xs text-gray-400 font-medium">
                    Total Amount After Discount
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-800">
                  {egp(summary.totalAmountAfterDiscount)}
                </p>
              </motion.div>

              <motion.div
                {...fadeUp(0.22)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={12} className="text-purple-400" />
                  <p className="text-xs text-gray-400 font-medium">
                    Total Amount After Tax
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-800">
                  {egp(summary.totalAmountAfterTax)}
                </p>
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
                Failed to load discount & tax data.
              </p>
            </div>
          ) : (
            <DataTable<DiscountTaxRow>
              columns={columns}
              data={data?.data ?? []}
              progressPending={isLoading}
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
                  <Tag size={28} className="text-gray-200" />
                  <p className="text-sm text-gray-400">
                    No discount & tax data found.
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

export default DiscountTaxPage;
