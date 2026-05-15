import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Search,
  Check,
  Plus,
  XCircle,
  Loader2,
  ChevronDown,
  Building2,
  X,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import {
  fetchContracts,
  fetchCreateContractOptions,
} from "@/features/Dashboard/services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContractItem {
  rowNumber: number;
  id: number;
  contractNo: string;
  instituteId: number;
  instituteName: string;
  academicYear: number;
  planId: number;
  planName: string;
  maxStudents: number;
  totalAmount: number;
  paidAmount: number;
  totalRemaining: number;
  installmentsCount: number;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

type StatusFilter = "all" | "ACTIVE" | "INACTIVE";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: StatusFilter; label: string; dot: string }[] = [
  { value: "all", label: "All Status", dot: "bg-gray-600" },
  { value: "ACTIVE", label: "Active", dot: "bg-green-500" },
  { value: "DRAFT", label: "Draft", dot: "bg-secondary" },
  { value: "CLOSED", label: "Closed", dot: "bg-gray-400" },
  { value: "CANCELLED", label: "Cancelled", dot: "bg-red-400" },
];

const statusConfig: Record<
  string,
  { class: string; dot: string; label: string }
> = {
  ACTIVE: {
    class: "bg-green-50 text-green-600",
    dot: "bg-green-500",
    label: "Active",
  },
  DRAFT: {
    class: "bg-blue-50 text-blue-500",
    dot: "bg-blue-400",
    label: "Draft",
  },
  CLOSED: {
    class: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
    label: "Closed",
  },
  PENDING: {
    class: "bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
    label: "Pending",
  },
  INACTIVE: {
    class: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
    label: "Inactive",
  },
};

const getStatusCfg = (status: string) =>
  statusConfig[status] ?? {
    class: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
    label: status,
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

const egp = (val: number) =>
  `EGP ${Number(val).toLocaleString("en-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const YEARS = ["2024", "2025", "2026", "2027"];

// ─── Institute Search Dropdown ────────────────────────────────────────────────

const InstituteSelect = ({
  value,
  onChange,
}: {
  value: { id: number; name: string } | null;
  onChange: (inst: { id: number; name: string } | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const { data: institutes = [] } = useQuery({
    queryKey: ["institutes-select"],
    queryFn: () => fetchCreateContractOptions(""),
  });

  const filtered = institutes?.institutes?.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
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
        className={`h-9 px-3 rounded-2xl border flex items-center gap-2 text-sm transition-colors min-w-[160px] ${
          value
            ? "bg-blue-500 text-white border-blue-500"
            : "border-gray-200 text-gray-500 hover:bg-gray-50"
        }`}
      >
        <Building2 size={14} />
        <span className="truncate max-w-[120px]">
          {value ? value.name : "Select Institute"}
        </span>
        {value ? (
          <X
            size={13}
            className="flex-shrink-0 hover:opacity-70"
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
            className="flex-shrink-0"
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
            className="absolute top-full mt-1 left-0 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Search inside dropdown */}
            <div className="p-2 border-b border-gray-50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search institute..."
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
            <div className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">
                  No institutes found
                </p>
              ) : (
                filtered.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => {
                      onChange(inst);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="truncate">{inst.name}</span>
                    {value?.id === inst.id && (
                      <Check
                        size={13}
                        className="text-blue-500 flex-shrink-0"
                      />
                    )}
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

const StatusSelect = ({
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

  const current = STATUS_OPTIONS.find((o) => o.value === value)!;

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`h-9 px-3 rounded-2xl border flex items-center gap-2 text-sm transition-colors select-none ${
          value !== "all"
            ? "bg-blue-500 text-white border-blue-500"
            : "border-gray-200 text-gray-500 hover:bg-gray-50"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${value !== "all" ? "bg-white" : current.dot}`}
        />
        <span>{current.label}</span>
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
            className="absolute top-full mt-1 left-0 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
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
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
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

const InstitutionsContractsList = () => {
  const [searchText, setSearchText] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedInstitute, setSelectedInstitute] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearchText(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const resetPage = () => setPage(1);

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "institute-annual-contracts",
      page,
      perPage,
      selectedYear,
      selectedInstitute?.id,
      statusFilter,
      searchText,
    ],
    queryFn: () =>
      fetchContracts({
        page,
        limit: perPage,
        Year: selectedYear ? Number(selectedYear) : undefined,
        instituteId: selectedInstitute?.id ?? undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchText || undefined,
      }),
  });

  const contracts: ContractItem[] = data?.items ?? [];
  const pagination: Pagination | undefined = data?.pagination;

  // ── Active filters count (for clear all) ──────────────────────────────────
  const activeFilterCount = [
    selectedInstitute,
    selectedYear,
    statusFilter !== "all",
    searchText,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSelectedInstitute(null);
    setSelectedYear("");
    setStatusFilter("all");
    setSearchInput("");
    setSearchText("");
    setPage(1);
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      name: "#",
      selector: (row: ContractItem) => row.rowNumber,
      width: "60px",
      center: true,
    },

    {
      name: "Institute",
      selector: (row: ContractItem) => row.instituteName,
      cell: (row: ContractItem) => (
        <span className="font-medium text-gray-800">{row.instituteName}</span>
      ),
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Year",
      selector: (row: ContractItem) => row.academicYear,
      sortable: true,
      center: true,
      width: "80px",
    },
    {
      name: "Plan",
      selector: (row: ContractItem) => row.planName,
      sortable: true,
      center: true,
      minWidth: "120px",
    },
    {
      name: "Max Students",
      selector: (row: ContractItem) => row.maxStudents,
      cell: (row: ContractItem) => row.maxStudents.toLocaleString(),
      sortable: true,
      center: true,
      minWidth: "120px",
    },
    {
      name: "Total Amount (EGP)",
      selector: (row: ContractItem) => row.totalAmount,
      cell: (row: ContractItem) => (
        <span className="font-semibold text-gray-800">
          {egp(row.totalAmount)}
        </span>
      ),
      sortable: true,
      center: true,
      minWidth: "170px",
    },
    {
      name: "Paid (EGP)",
      selector: (row: ContractItem) => row.paidAmount,
      cell: (row: ContractItem) => (
        <span className="font-semibold text-green-600">
          {egp(row.paidAmount)}
        </span>
      ),
      sortable: true,
      center: true,
      minWidth: "150px",
    },
    {
      name: "Remaining (EGP)",
      selector: (row: ContractItem) => row.totalRemaining,
      cell: (row: ContractItem) => (
        <span
          className={`font-semibold ${row.totalRemaining > 0 ? "text-red-500" : "text-gray-400"}`}
        >
          {egp(row.totalRemaining)}
        </span>
      ),
      sortable: true,
      center: true,
      minWidth: "160px",
    },
    {
      name: "Status",
      cell: (row: ContractItem) => {
        const cfg = getStatusCfg(row.status);
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.class}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        );
      },
      sortable: false,
      center: true,
      minWidth: "130px",
    },
    {
      name: "Edit",
      cell: (row: ContractItem) => (
        <Link
          to={`/dashboard/institutions-contracts/edit/${row.id}`}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="Edit"
        >
          <EditIcon className="text-secondary" />
        </Link>
      ),
      ignoreRowClick: true,
      center: true,
      minWidth: "100px",
    },
    {
      name: "View",
      cell: (row: ContractItem) => (
        <Link
          to={`/dashboard/institutions-contracts/${row.id}`}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="View"
        >
          <Eye size={25} className="text-gray-500" />
        </Link>
      ),
      ignoreRowClick: true,
      center: true,
      minWidth: "50px",
    },
  ];

  // ── Sub-header ─────────────────────────────────────────────────────────────
  const subHeaderComponent = (
    <div className="flex flex-col gap-2 w-full px-1 py-2">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Institute searchable dropdown */}
          <InstituteSelect
            value={selectedInstitute}
            onChange={(inst) => {
              setSelectedInstitute(inst);
              resetPage();
            }}
          />

          {/* Year */}
          <div className="relative">
            <select
              className={`h-9 pl-3 pr-8 rounded-2xl border text-sm transition-colors cursor-pointer appearance-none ${
                selectedYear
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
              }`}
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                resetPage();
              }}
            >
              <option value="">Select Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                selectedYear ? "text-white" : "text-gray-400"
              }`}
            />
          </div>

          {/* Status */}
          <StatusSelect
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
          />

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by contract, institute..."
              className="border border-gray-200 h-9 px-9 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-56"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                resetPage();
              }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={15} />
            </span>
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchText("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
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
                onClick={clearAll}
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

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageTitle
        text="Institutions Contracts List"
        button
        buttonText={
          <Link
            to="/dashboard/institutions-contracts/create"
            className="flex items-center py-1.5"
          >
            <Plus size={16} className="mx-2" color="white" />
            <span className="me-3 text-white">Create New Contract</span>
          </Link>
        }
      />

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-white"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading contracts...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16 gap-2 text-red-400">
            <XCircle size={20} />
            <span className="text-sm">
              Failed to load contracts. Try again.
            </span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={contracts}
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
        )}
      </motion.div>
    </div>
  );
};

export default InstitutionsContractsList;
