import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── API ─────────────────────────────────────────────────────────────────────

interface FeeFilters {
  fromDate: string;
  toDate: string;
  planId: string;
  page: number;
  limit: number;
}

interface FeeRow {
  planId: number;
  planName: string;
  contracts: number;
  administrativeFees: number;
  averageFeePerContract: number;
  percentageOfContractValue: number;
}

interface FeeSummary {
  totalAdministrativeFees: number;
  contractsIncluded: number;
  averageFeePerContract: number;
  percentageOfTotalValue: number;
}

interface FeeResponse {
  summary: FeeSummary;
  data: FeeRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    count: number;
  };
}

async function fetchAdministrativeFees(
  filters: FeeFilters,
): Promise<FeeResponse> {
  const params: Record<string, string | number> = {
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.planId) params.planId = filters.planId;
  const res = await dashboardApi.get("/billing-reports/administrative-fees", {
    params,
  });
  return res.data.data;
}
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

async function exportAdministrativeFees(filters: FeeFilters): Promise<Blob> {
  const params: Record<string, string | number> = {
    reportType: "ADMINISTRATIVE_FEES",
    format: "EXCEL",
    academicYear: new Date(filters.fromDate).getFullYear(),
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  };
  if (filters.planId) params.planId = filters.planId;
  const res = await dashboardApi.get("/billing-reports/export", {
    params,
    responseType: "blob",
  });
  return res.data;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `EGP ${n.toLocaleString("en-EG", { minimumFractionDigits: 0 })}`;

// ─── react-data-table-component custom styles ─────────────────────────────────

const customTableStyles = {
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      borderBottomColor: "#e2e8f0",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      minHeight: "44px",
    },
  },
  headCells: {
    style: {
      fontSize: "11px",
      fontWeight: "700",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#334155",
      minHeight: "52px",
      borderBottomColor: "#f1f5f9",
      "&:hover": {
        backgroundColor: "#eff6ff",
        cursor: "default",
      },
    },
  },
  cells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  pagination: {
    style: {
      borderTopColor: "#f1f5f9",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      color: "#64748b",
      fontSize: "13px",
    },
    pageButtonsStyle: {
      borderRadius: "8px",
      color: "#475569",
      fill: "#475569",
      "&:hover:not(:disabled)": {
        backgroundColor: "#eff6ff",
        fill: "#2563eb",
      },
      "&:focus": {
        outline: "none",
        backgroundColor: "#eff6ff",
      },
    },
  },
  noData: {
    style: {
      padding: "48px",
      color: "#94a3b8",
      fontSize: "14px",
    },
  },
  progress: {
    style: {
      padding: "32px",
    },
  },
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">
        {value}
      </p>
    </div>
  );
}

// ─── ROW NUMBER COLUMN ────────────────────────────────────────────────────────

function RowNumber({ row, rows }: { row: FeeRow; rows: FeeRow[] }) {
  const idx = rows.findIndex((r) => r.planId === row.planId);
  return <span className="text-xs font-medium text-slate-400">{idx + 1}</span>;
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AdministrativeFeesPage() {
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const today = new Date().toISOString().slice(0, 10);
  const { t } = useLanguage();
  const [fromDate, setFromDate] = useState(yearStart);
  const [toDate, setToDate] = useState(today);
  const [planId, setPlanId] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState<FeeFilters>({
    fromDate: yearStart,
    toDate: today,
    planId: "",
    page: 1,
    limit: 10,
  });
  const [exporting, setExporting] = useState(false);

  const PLAN_OPTIONS = [
    { label: t("administrativeFeesPlanAll"), value: "" },
    { label: t("administrativeFeesPlanStarter"), value: "1" },
    { label: t("administrativeFeesPlanGrowth"), value: "2" },
    { label: t("administrativeFeesPlanEnterprise"), value: "3" },
    { label: t("administrativeFeesPlanCustom"), value: "4" },
  ];

  const { data, isFetching, isError } = useQuery({
    queryKey: ["administrative-fees", activeFilters],
    queryFn: () => fetchAdministrativeFees(activeFilters),
    placeholderData: (prev) => prev,
  });

  const applyFilters = useCallback(() => {
    setPage(1);
    setActiveFilters({ fromDate, toDate, planId, page: 1, limit: perPage });
  }, [fromDate, toDate, planId, perPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setActiveFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handlePerRowsChange = (newPerPage: number, newPage: number) => {
    setPerPage(newPerPage);
    setPage(newPage);
    setActiveFilters((prev) => ({ ...prev, limit: newPerPage, page: newPage }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportAdministrativeFees(activeFilters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `administrative-fees-${activeFilters.fromDate}-${activeFilters.toDate}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary;
  const rows = data?.data ?? [];
  const meta = data?.meta;

  const columns = [
    {
      name: t("administrativeFeesColumnNumber"),
      width: "60px",
      center: true,
      cell: (row) => <RowNumber row={row} rows={rows} />,
    },
    {
      name: t("administrativeFeesColumnPlan"),
      selector: (row) => row.planName,
      sortable: true,
    },
    {
      name: t("administrativeFeesColumnContracts"),
      selector: (row) => row.contracts,
      sortable: true,
      center: true,
    },
    {
      name: t("administrativeFeesColumnAdministrativeFees"),
      selector: (row) => row.administrativeFees,
      sortable: true,
      right: true,
      cell: (row) => fmt(row.administrativeFees),
    },
    {
      name: t("administrativeFeesColumnAvgFeePerContract"),
      selector: (row) => row.averageFeePerContract,
      sortable: true,
      right: true,
      cell: (row) => fmt(row.averageFeePerContract),
    },
    {
      name: t("administrativeFeesColumnPercentContractValue"),
      selector: (row) => row.percentageOfContractValue,
      sortable: true,
      right: true,
      cell: (row) => `${row.percentageOfContractValue.toFixed(2)}%`,
    },
  ];

  return (
    <>
      <DashboardPageTitle text={t("administrativeFeesPageTitle")} />
      <div className=" bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* ── Breadcrumb ── */}
          <motion.nav
            {...fadeUp(0)}
            className="flex items-center gap-1.5 text-sm text-gray-400"
          >
            <Link
              to="/dashboard/home"
              className="hover:text-gray-600 transition-colors"
            >
              {t("administrativeFeesBreadcrumbDashboard")}
            </Link>
            <ChevronRight size={13} />
            <span className="text-gray-600 font-medium">
              {t("administrativeFeesBreadcrumbReports")}
            </span>
            <ChevronRight size={13} />
            <span className="text-gray-600 font-medium">
              {t("administrativeFeesBreadcrumbAdministrativeFees")}
            </span>
          </motion.nav>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t("administrativeFeesFilterFromDate")}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t("administrativeFeesFilterToDate")}
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t("administrativeFeesFilterPlan")}
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
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {t("administrativeFeesFilterButton")}
            </button>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exporting
                ? t("administrativeFeesExporting")
                : t("administrativeFeesExport")}
            </button>
          </div>

          {isError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium">
              {t("administrativeFeesErrorFailedToLoad")}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label={t("administrativeFeesSummaryTotalFees")}
                  value={summary ? fmt(summary.totalAdministrativeFees) : "—"}
                />
                <StatCard
                  label={t("administrativeFeesSummaryContractsIncluded")}
                  value={summary ? String(summary.contractsIncluded) : "—"}
                />
                <StatCard
                  label={t("administrativeFeesSummaryAvgFeePerContract")}
                  value={summary ? fmt(summary.averageFeePerContract) : "—"}
                />
                <StatCard
                  label={t("administrativeFeesSummaryPercentOfTotalValue")}
                  value={
                    summary
                      ? `${summary.percentageOfTotalValue.toFixed(2)}%`
                      : "—"
                  }
                />
              </div>

              {/* DataTable Card */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <DataTable
                  columns={columns}
                  data={rows}
                  progressPending={isFetching}
                  progressComponent={
                    <div className="w-full space-y-3 px-4 py-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-4 rounded-md bg-slate-100 animate-pulse"
                        />
                      ))}
                    </div>
                  }
                  pagination
                  paginationServer
                  paginationTotalRows={meta?.total ?? 0}
                  paginationDefaultPage={page}
                  paginationPerPage={perPage}
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  paginationRowsPerPageOptions={[10, 25, 50]}
                  customStyles={customTableStyles}
                  noDataComponent={
                    <div className="py-12 text-slate-400 text-sm">
                      {t("administrativeFeesNoResults")}
                    </div>
                  }
                  highlightOnHover
                  responsive
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
