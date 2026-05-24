import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Eye,
  ChevronDown,
  Receipt,
  TrendingUp,
  ChevronRight,
  XCircle,
  Search,
  X,
  Building2,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  fetchContracts,
  fetchPaymentsHistory,
} from "@/features/Dashboard/services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  paymentId: number;
  paymentDate: string;
  contractNo: number;
  installment: { installmentNo: number };
  amount: number;
  paymentMethod: string;
  receiptNo: number;
  status: string;
}

interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ContractOption {
  id: number;
  contractNo: string;
  instituteName: string;
}

type StatusFilter = "CONFIRMED" | "CANCELLED" | "REFUNDED" | "ALL";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: StatusFilter; label: string; dot: string }[] = [
  { value: "ALL", label: "All", dot: "bg-green-500" },
  { value: "CONFIRMED", label: "Confirmed", dot: "bg-green-500" },
  { value: "CANCELLED", label: "Cancelled", dot: "bg-blue-400" },
  { value: "REFUNDED", label: "Refunded", dot: "bg-amber-400" },
];

const statusConfig: Record<
  string,
  { class: string; dot: string; label: string }
> = {
  CONFIRMED: {
    class: "bg-green-50 text-green-600 border-green-200 text-nowrap",
    dot: "bg-green-500",
    label: "Confirmed",
  },
  CANCELLED: {
    class: "bg-red-50 text-red-500 border-red-200 text-nowrap",
    dot: "bg-red-400",
    label: "Cancelled",
  },
  REFUNDED: {
    class: "bg-amber-50 text-amber-600 border-amber-200 text-nowrap",
    dot: "bg-amber-400",
    label: "Refunded",
  },
};

const getStatusCfg = (status: string) =>
  statusConfig[status] ?? {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    label: status,
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number | string) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]) + " Payment";
};

// ─── Custom Styles ────────────────────────────────────────────────────────────

const customStyles = {
  rows: { style: { minHeight: "56px", borderBottom: "1px solid #f3f4f6" } },
  subHeader: {
    style: { paddingLeft: "0", paddingRight: "0", paddingBottom: "0" },
  },
  headRow: { style: { backgroundColor: "#f9fafb" } },
  headCells: {
    style: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#374151",
      justifyContent: "center",
    },
  },
  cells: {
    style: { fontSize: "13px", color: "#374151", justifyContent: "center" },
  },
  pagination: {
    style: { borderTop: "1px solid #f3f4f6", borderRadius: "0 0 12px 12px" },
  },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  subColor,
  icon,
  borderColor,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  icon: React.ReactNode;
  borderColor: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border-l-4 border border-gray-100 shadow-sm ${borderColor}`}
  >
    <div className="flex-shrink-0 text-gray-400">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <motion.p
          key={value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-lg font-bold text-gray-900 truncate"
        >
          {value}
        </motion.p>
        {sub && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${subColor}`}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Contract Searchable Dropdown ─────────────────────────────────────────────

const ContractSelect = ({
  value,
  onChange,
}: {
  value: ContractOption | null;
  onChange: (c: ContractOption | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Fetch all contracts with a big limit to avoid pagination
  const { data: contractsData } = useQuery({
    queryKey: ["contracts-select"],
    queryFn: () => fetchContracts({ page: 1, limit: 1000 }),
  });

  const contracts: ContractOption[] = (contractsData?.items ?? []).map(
    (c: { id: number; contractNo: string; instituteName: string }) => ({
      id: c.id,
      contractNo: c.contractNo,
      instituteName: c.instituteName,
    }),
  );

  const filtered = useMemo(
    () =>
      contracts.filter(
        (c) =>
          c.contractNo.toLowerCase().includes(search.toLowerCase()) ||
          c.instituteName.toLowerCase().includes(search.toLowerCase()),
      ),
    [contracts, search],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`h-9 px-3 rounded-2xl border flex items-center gap-2 text-sm transition-colors min-w-[180px] ${
          value
            ? "bg-blue-500 text-white border-blue-500"
            : "border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
        }`}
      >
        <Building2 size={14} />
        <span className="truncate max-w-[140px]">
          {value ? `${value.contractNo}` : "Select Contract"}
        </span>
        {value ? (
          <X
            size={13}
            className="flex-shrink-0 hover:opacity-70 ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              setOpen(false);
            }}
          />
        ) : (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 ml-auto"
          >
            <ChevronDown size={13} />
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 left-0 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search contract or institute..."
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No contracts found
                </p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {c.contractNo}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {c.instituteName}
                        </p>
                      </div>
                      {value?.id === c.id && (
                        <Check
                          size={13}
                          className="text-blue-500 flex-shrink-0"
                        />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Status Dropdown ──────────────────────────────────────────────────────────

const StatusDropdown = ({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`h-9 px-3 rounded-2xl border flex items-center gap-2 text-sm transition-colors select-none ${
          value !== "all"
            ? "bg-blue-500 text-white border-blue-500"
            : "border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
        }`}
      >
        {value !== "all" && (
          <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
        )}
        <span>
          {value === "all"
            ? "All Status"
            : STATUS_OPTIONS.find((o) => o.value === value)?.label}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={13} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 left-0 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                  {opt.label}
                </div>
                {value === opt.value && (
                  <Check size={13} className="text-blue-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const InstallmentsScheduleList = () => {
  const { contractId: urlContractId } = useParams<{ contractId?: string }>();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [selectedContract, setSelectedContract] =
    useState<ContractOption | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [fromDate, setfromDate] = useState("");
  const [toDate, settoDate] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Resolve which contractId to use (from URL or selected dropdown)
  const activeContractId = urlContractId ?? String(selectedContract?.id ?? "");

  // Active filter count for clear button
  const activeFilterCount = [
    selectedContract && !urlContractId,
    statusFilter !== "ALL",
    fromDate,
    toDate,
  ].filter(Boolean).length;

  const clearFilters = () => {
    if (!urlContractId) setSelectedContract(null);
    setStatusFilter("ALL");
    setfromDate("");
    settoDate("");
    setPage(1);
  };

  const resetPage = () => setPage(1);

  // ── Installments query ─────────────────────────────────────────────────────
  const {
    data: paymentsData,
    isLoading,
    isError: listError,
  } = useQuery({
    queryKey: [
      "installments",
      activeContractId,
      statusFilter,
      fromDate,
      toDate,
      page,
      perPage,
    ],
    queryFn: () =>
      fetchPaymentsHistory({
        contractId: activeContractId,
        status: statusFilter !== "ALL" ? statusFilter : "",
        year: "",
        fromDate,
        toDate,
        page: String(page),
        limit: String(perPage),
      }),
  });
  console.log(paymentsData);

  const installments: Payment[] = paymentsData?.data ?? [];

  const pagination: ApiPagination | undefined = paymentsData?.meta;

  const summary = paymentsData?.summary;

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      name: "#",
      selector: (_: unknown, index: number) => (page - 1) * perPage + index + 1,
      width: "60px",
      center: true,
    },
    {
      name: "Payment ID",
      selector: (row: Payment) => row.paymentId,
      cell: (row: Payment) => (
        <Link
          to={`/dashboard/contract-payments/${row.paymentId}`}
          className="font-medium underline text-secondary"
        >
          {row.paymentId}
        </Link>
      ),
      sortable: true,
      minWidth: "60px",
    },
    {
      name: "Payment Date",
      selector: (row: Payment) => row.paymentDate,
      cell: (row: Payment) => (
        <span className="text-gray-600 font-medium">{row.paymentDate}</span>
      ),
      sortable: true,
      center: true,
      minWidth: "90px",
    },
    {
      name: "Contract No.",
      selector: (row: Payment) => Number(row.contractNo),
      cell: (row: Payment) => (
        <span className="font-semibold text-gray-800">
          {row.contractNo ?? "-"}
        </span>
      ),
      sortable: true,
      center: true,
      minWidth: "90px",
    },
    {
      name: "Installment",
      selector: (row: Payment) => Number(row.installment),
      cell: (row: Payment) => (
        <span className=" text-gray-800">
          {ordinal(row.installment?.installmentNo)}
        </span>
      ),
      sortable: true,
      center: true,
      minWidth: "90px",
    },
    {
      name: "Amount",
      selector: (row: Payment) => Number(row.amount),
      cell: (row: Payment) => (
        <span
          className={`font-semibold ${Number(row.amount) > 0 ? "text-green-500" : "text-red-400"}`}
        >
          {egp(row.amount)}
        </span>
      ),
      sortable: true,
      center: true,
      minWidth: "160px",
    },
    {
      name: "Method",
      selector: (row: Payment) => row.paymentMethod,
      cell: (row: Payment) => (
        <span className={`text-gray-800`}>{row.paymentMethod}</span>
      ),
      sortable: true,
      center: true,
      minWidth: "10px",
    },
    {
      name: "Receipt No.",
      selector: (row: Payment) => row.receiptNo,
      cell: (row: Payment) => (
        <span className={`text-gray-800`}>{row.receiptNo}</span>
      ),
      sortable: true,
      center: true,
      minWidth: "160px",
    },
    {
      name: "Status",
      cell: (row: Payment) => {
        const cfg = getStatusCfg(row.status);
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cfg.class}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        );
      },
      sortable: true,
      center: true,
      minWidth: "120px",
    },

    {
      name: "Details",
      cell: (row: Payment) => (
        <Link
          to={`/dashboard/payments/${row.paymentId}`}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="View"
        >
          <Eye size={16} className="text-gray-500" />
        </Link>
      ),
      ignoreRowClick: true,
      center: true,
      width: "60px",
    },
  ];

  // ── Sub-header ─────────────────────────────────────────────────────────────
  const subHeaderComponent = (
    <div className="flex flex-col gap-2 w-full px-1 py-2">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Contract dropdown — hidden if contractId is in URL */}
          {!urlContractId && (
            <ContractSelect
              value={selectedContract}
              onChange={(c) => {
                setSelectedContract(c);
                resetPage();
              }}
            />
          )}

          {/* Status */}
          <StatusDropdown
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
          />

          {/* Due From */}
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-500">
            <span className="text-xs text-gray-400 whitespace-nowrap">
              From
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setfromDate(e.target.value);
                resetPage();
              }}
              className="text-sm text-gray-700 focus:outline-none bg-transparent w-32"
            />
            {fromDate && (
              <button
                onClick={() => {
                  setfromDate("");
                  resetPage();
                }}
              >
                <X size={12} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Due To */}
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-500">
            <span className="text-xs text-gray-400 whitespace-nowrap">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                settoDate(e.target.value);
                resetPage();
              }}
              className="text-sm text-gray-700 focus:outline-none bg-transparent w-32"
            />
            {toDate && (
              <button
                onClick={() => {
                  settoDate("");
                  resetPage();
                }}
              >
                <X size={12} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Clear all */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="h-9 px-3 rounded-2xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors flex items-center gap-1.5"
              >
                <X size={13} />
                Clear ({activeFilterCount})
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (listError) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text="Installments Schedule List" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-3"
        >
          <XCircle size={36} className="text-red-300" />
          <p className="text-sm font-medium text-red-400">
            Failed to load installments.
          </p>
          <Link
            to="/dashboard/institutions-contracts"
            className="text-sm text-blue-500 hover:underline"
          >
            Back to Contracts
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageTitle text="Payments History" />

      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-1 text-sm text-gray-400 -mt-3"
      >
        <Link
          to="/dashboard/home"
          className="hover:text-gray-600 transition-colors"
        >
          Dashboard
        </Link>

        <ChevronRight size={14} />

        <span className="text-gray-600">Payments</span>
      </motion.nav>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Payments"
          value={summary ? summary.totalPayments : "-"}
          icon={<Receipt size={20} />}
          borderColor="border-l-blue-400"
          delay={0.05}
        />
        <StatCard
          label="Current Page Confirmed Net Paid"
          value={summary ? egp(summary.currentPageConfirmedNetPaid) : "-"}
          subColor="bg-green-100 text-green-700"
          icon={<TrendingUp size={20} className="text-green-500" />}
          borderColor="border-l-green-400"
          delay={0.1}
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rounded-xl border border-gray-100 shadow-sm bg-white"
      >
        <DataTable
          columns={columns}
          data={installments}
          customStyles={customStyles}
          highlightOnHover
          pagination
          paginationServer
          paginationTotalRows={pagination?.total ?? 0}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[5, 10, 25]}
          onChangePage={(p) => setPage(p)}
          onChangeRowsPerPage={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
          subHeader
          subHeaderComponent={subHeaderComponent}
        />
      </motion.div>
    </div>
  );
};

export default InstallmentsScheduleList;
