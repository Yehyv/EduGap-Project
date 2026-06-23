import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  AlertCircle,
  FileX,
  Eye,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InstallmentRow {
  installmentId: number;
  installmentNo: number;
  label: string;
  dueDate: string;
  installmentAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
}

interface NextInstallment {
  installmentId: number;
  installmentNo: number;
  label: string;
  dueDate: string;
  amount: number;
  installmentAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
}

interface InstallmentsResponse {
  summary: {
    totalInstallments: number;
    paidInstallments: number;
    remainingInstallments: number;
    totalAmount: number;
  };
  data: InstallmentRow[];
  nextInstallment: NextInstallment | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    count: number;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchInstituteInstallments(
  academicYear: number,
  page: number,
  limit: number,
): Promise<InstallmentsResponse | null> {
  try {
    const res = await dashboardApi.get(
      `/annual-settlements/institute/installments?academicYear=${academicYear}&page=${page}&limit=${limit}`,
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  string,
  { cls: string; label: string; Icon: React.ElementType }
> = {
  PAID: {
    cls: "bg-green-50 text-green-600 border-green-200",
    label: "Paid",
    Icon: CheckCircle2,
  },
  PENDING: {
    cls: "bg-amber-50 text-amber-600 border-amber-200",
    label: "Pending",
    Icon: Clock,
  },
  OVERDUE: {
    cls: "bg-red-50 text-red-500 border-red-200",
    label: "Overdue",
    Icon: AlertCircle,
  },
  PARTIAL: {
    cls: "bg-blue-50 text-blue-500 border-blue-200",
    label: "Partial",
    Icon: Clock,
  },
  CLOSED: {
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    label: "Closed",
    Icon: XCircle,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status] ?? {
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    label: status,
    Icon: Clock,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}
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
}) => (
  <motion.div
    {...fadeUp(0.05)}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 gap-4"
  >
    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
      <FileX size={28} className="text-gray-300" />
    </div>
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-sm font-semibold text-gray-700">
        No installments for {year}
      </p>
      <p className="text-xs text-gray-400 max-w-xs">
        There is no active annual contract for this academic year.
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
            Try {y}
          </button>
        ))}
    </div>
  </motion.div>
);

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

const InstituteInstallmentsPage = () => {
  const navigate = useNavigate();
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["institute-installments", academicYear, page, limit],
    queryFn: () => fetchInstituteInstallments(academicYear, page, limit),
    placeholderData: (prev) => prev,
    retry: false,
  });

  const handleYearChange = (y: number) => {
    setAcademicYear(y);
    setPage(1);
  };

  // ── Columns ──
  const columns = [
    {
      name: "#",
      width: "56px",
      cell: (_row: InstallmentRow, idx: number) => (
        <span className="text-gray-400 text-xs font-medium">
          {(page - 1) * limit + idx + 1}
        </span>
      ),
    },
    {
      name: "Installment No.",
      selector: (row: InstallmentRow) => row.label,
      cell: (row: InstallmentRow) => (
        <span className="font-medium text-gray-800">{row.label}</span>
      ),
      grow: 1,
    },
    {
      name: "Due Date",
      selector: (row: InstallmentRow) => row.dueDate,
      cell: (row: InstallmentRow) => (
        <span className="text-gray-600">{fmtDate(row.dueDate)}</span>
      ),
    },
    {
      name: "Installment Amount",
      selector: (row: InstallmentRow) => row.installmentAmount,
      cell: (row: InstallmentRow) => (
        <span className="text-gray-700">{egp(row.installmentAmount)}</span>
      ),
      right: true,
    },
    {
      name: "Paid Amount",
      selector: (row: InstallmentRow) => row.paidAmount,
      cell: (row: InstallmentRow) => (
        <span
          className={`font-medium ${row.paidAmount > 0 ? "text-green-600" : "text-gray-400"}`}
        >
          {egp(row.paidAmount)}
        </span>
      ),
      right: true,
    },
    {
      name: "Status",
      center: true,
      cell: (row: InstallmentRow) => <StatusBadge status={row.status} />,
    },
    // {
    //   name: "Action",
    //   center: true,
    //   cell: (row: InstallmentRow) => (
    //     <button
    //       type="button"
    //       onClick={() =>
    //         navigate(`/dashboard/billing/installments/${row.installmentId}`)
    //       }
    //       className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-colors"
    //       title="View Details"
    //     >
    //       <Eye size={14} />
    //     </button>
    //   ),
    // },
  ];

  const summary = data?.summary;
  const nextInstallment = data?.nextInstallment;

  return (
    <>
      {/* ── Page header ── */}
      <DashboardPageTitle text="Institution Installment Schedule" />
      {/* ── Breadcrumb ── */}
      <motion.nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
        <Link
          to="/dashboard/home"
          className="hover:text-gray-600 transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight size={13} />
        <span className="text-gray-600 font-medium">Installment Schedule</span>
      </motion.nav>
      <div className="flex flex-col gap-5 pb-8">
        {/* ── Loading skeleton ── */}
        {isLoading && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Sk key={i} className="h-20" />
              ))}
            </div>
            <Sk className="h-64" />
            <Sk className="h-16" />
          </div>
        )}

        {/* ── Real error ── */}
        {isError && !isLoading && (
          <motion.div
            {...fadeUp(0.05)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3"
          >
            <AlertCircle size={32} className="text-red-300" />
            <p className="text-sm text-red-400">
              Something went wrong. Please try again.
            </p>
          </motion.div>
        )}

        {/* ── No contract ── */}
        {!isLoading && !isError && data === null && (
          <NoContractState
            year={academicYear}
            onChangeYear={handleYearChange}
          />
        )}

        {/* ── Content ── */}
        {!isLoading && !isError && data && (
          <>
            {/* ── Summary KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Installments",
                  value: summary!.totalInstallments,
                  color: "",
                },
                {
                  label: "Paid Installments",
                  value: summary!.paidInstallments,
                  color: "text-green-600",
                },
                {
                  label: "Remaining Installments",
                  value: summary!.remainingInstallments,
                  color: "text-amber-600",
                },
                {
                  label: "Total Amount",
                  value: egp(summary!.totalAmount),
                  color: "",
                },
              ].map(({ label, value, color }, i) => (
                <motion.div
                  key={label}
                  {...fadeUp(0.06 + i * 0.04)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-1"
                >
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p
                    className={`text-2xl font-bold text-gray-800 leading-tight ${color}`}
                  >
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* ── DataTable ── */}
            <motion.div
              {...fadeUp(0.2)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <DataTable<InstallmentRow>
                columns={columns}
                data={data.data}
                progressPending={isFetching && !data}
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
                    <FileX size={28} className="text-gray-200" />
                    <p className="text-sm text-gray-400">
                      No installments found.
                    </p>
                  </div>
                }
                pagination
                paginationServer
                paginationTotalRows={data.meta.total}
                paginationDefaultPage={page}
                paginationPerPage={limit}
                onChangePage={(p) => setPage(p)}
                onChangeRowsPerPage={(l, p) => {
                  setLimit(l);
                  setPage(p);
                }}
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

            {/* ── Next Installment banner ── */}
            {nextInstallment && (
              <motion.div
                {...fadeUp(0.28)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Next Installment
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {nextInstallment.label} is due on{" "}
                    <span className="text-secondary">
                      {fmtDate(nextInstallment.dueDate)}
                    </span>
                    {" · "}
                    <span className="text-gray-700">
                      {egp(nextInstallment.remainingAmount)}
                    </span>
                  </p>
                </div>

                <Link
                  to={`/dashboard/payment-proof`}
                  className="h-10 px-6 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <CreditCard size={14} />
                  Pay Now
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default InstituteInstallmentsPage;
