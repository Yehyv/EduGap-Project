import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Pencil,
  Search,
  SlidersHorizontal,
  Check,
  Plus,
  FileText,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Contract {
  id: number;
  institute: string;
  year: number;
  plan: string;
  maxStudents: number;
  totalAmount: number;
  paidAmount: number;
  status: "Active" | "Closed" | "Pending";
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_CONTRACTS: Contract[] = [
  {
    id: 1,
    institute: "Almarefa Institute",
    year: 2025,
    plan: "Growth Plan",
    maxStudents: 2000,
    totalAmount: 360000,
    paidAmount: 180000,
    status: "Active",
  },
  {
    id: 2,
    institute: "Attamia Institute",
    year: 2025,
    plan: "Starter Plan",
    maxStudents: 500,
    totalAmount: 100000,
    paidAmount: 75000,
    status: "Active",
  },
  {
    id: 3,
    institute: "Future Academy",
    year: 2025,
    plan: "Enterprise Plan",
    maxStudents: 5000,
    totalAmount: 750000,
    paidAmount: 375000,
    status: "Active",
  },
  {
    id: 4,
    institute: "Smart Learning Inst.",
    year: 2024,
    plan: "Growth Plan",
    maxStudents: 1500,
    totalAmount: 270000,
    paidAmount: 270000,
    status: "Closed",
  },
  {
    id: 5,
    institute: "Knowledge House",
    year: 2025,
    plan: "Starter Plan",
    maxStudents: 300,
    totalAmount: 60000,
    paidAmount: 10000,
    status: "Active",
  },
  {
    id: 6,
    institute: "Success Academy",
    year: 2025,
    plan: "Enterprise Plan",
    maxStudents: 4000,
    totalAmount: 600000,
    paidAmount: 300000,
    status: "Active",
  },
  {
    id: 7,
    institute: "Nile Learning Center",
    year: 2024,
    plan: "Starter Plan",
    maxStudents: 450,
    totalAmount: 90000,
    paidAmount: 0,
    status: "Pending",
  },
  {
    id: 8,
    institute: "Cairo Digital Academy",
    year: 2025,
    plan: "Growth Plan",
    maxStudents: 1800,
    totalAmount: 324000,
    paidAmount: 162000,
    status: "Active",
  },
  {
    id: 9,
    institute: "Delta Tech Institute",
    year: 2024,
    plan: "Enterprise Plan",
    maxStudents: 3000,
    totalAmount: 450000,
    paidAmount: 450000,
    status: "Closed",
  },
  {
    id: 10,
    institute: "Alexandria Institute",
    year: 2025,
    plan: "Growth Plan",
    maxStudents: 1200,
    totalAmount: 216000,
    paidAmount: 108000,
    status: "Active",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

const YEARS = ["2024", "2025", "2026"];
const PLANS = ["Starter Plan", "Growth Plan", "Enterprise Plan"];
type StatusFilter = "all" | "Active" | "Closed" | "Pending";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Closed", label: "Closed" },
  { value: "Pending", label: "Pending" },
];

const statusConfig = {
  Active: {
    class: "bg-green-50 text-green-600",
    dot: "bg-green-500",
    icon: <CheckCircle2 size={11} />,
  },
  Closed: {
    class: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
    icon: <XCircle size={11} />,
  },
  Pending: {
    class: "bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
    icon: <Clock size={11} />,
  },
};

// ─── Custom Styles ────────────────────────────────────────────────────────────

const customStyles = {
  rows: {
    style: { minHeight: "56px", borderBottom: "1px solid #f3f4f6" },
  },
  subHeader: {
    style: { paddingLeft: "0", paddingRight: "0", paddingBottom: "0" },
  },
  headRow: {
    style: { backgroundColor: "#f9fafb" },
  },
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

// ─── Format EGP ──────────────────────────────────────────────────────────────

const egp = (val: number) => `EGP ${val.toLocaleString("en-EG")}`;

// ─── Main Component ───────────────────────────────────────────────────────────

const InstitutionsContractsList = () => {
  const [filterText, setFilterText] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return DUMMY_CONTRACTS.filter((c) => {
      const matchesText =
        c.institute.toLowerCase().includes(filterText.toLowerCase()) ||
        c.plan.toLowerCase().includes(filterText.toLowerCase());
      const matchesYear = selectedYear ? String(c.year) === selectedYear : true;
      const matchesPlan = selectedPlan ? c.plan === selectedPlan : true;
      const matchesStatus =
        statusFilter === "all" ? true : c.status === statusFilter;
      return matchesText && matchesYear && matchesPlan && matchesStatus;
    });
  }, [filterText, selectedYear, selectedPlan, statusFilter]);

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      name: "#",
      selector: (_: unknown, index: number) => index + 1,
      width: "60px",
      center: true,
    },
    {
      name: "Institute",
      selector: (row: Contract) => row.institute,
      cell: (row: Contract) => (
        <span className="font-medium text-gray-800">{row.institute}</span>
      ),
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Year",
      selector: (row: Contract) => row.year,
      sortable: true,
      center: true,
      width: "90px",
    },
    {
      name: "Plan",
      selector: (row: Contract) => row.plan,
      sortable: true,
      center: true,
      minWidth: "140px",
    },
    {
      name: "Max Students",
      selector: (row: Contract) => row.maxStudents,
      cell: (row: Contract) => row.maxStudents.toLocaleString(),
      sortable: true,
      center: true,
      minWidth: "130px",
    },
    {
      name: "Total Amount (EGP)",
      selector: (row: Contract) => row.totalAmount,
      cell: (row: Contract) => (
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
      selector: (row: Contract) => row.paidAmount,
      cell: (row: Contract) => (
        <span className="font-semibold text-green-600">
          {egp(row.paidAmount)}
        </span>
      ),
      sortable: true,
      center: true,
      minWidth: "150px",
    },
    {
      name: "Status",
      cell: (row: Contract) => {
        const cfg = statusConfig[row.status];
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.class}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {row.status}
          </span>
        );
      },
      sortable: true,
      center: true,
      minWidth: "110px",
    },
    {
      name: "Actions",
      cell: (row: Contract) => (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/dashboard/institutions-contracts/${row.id}`}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="View"
          >
            <Eye size={16} className="text-gray-500" />
          </Link>
          <Link
            to={`/dashboard/institutions-contracts/edit/${row.id}`}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <Pencil size={16} className="text-gray-500" />
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      center: true,
      minWidth: "100px",
    },
  ];

  // ── Sub-header ─────────────────────────────────────────────────────────────
  const subHeaderComponent = (
    <div className="flex flex-wrap gap-2 w-full items-center justify-between px-1 py-2">
      {/* Left filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Institute search / Select Institute */}
        <select
          className="h-9 px-3 rounded-2xl border border-gray-200 text-sm text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          value={selectedPlan ? "plan" : ""}
          onChange={() => {}}
        >
          <option value="">Select Institute</option>
        </select>

        {/* Year */}
        <select
          className="h-9 px-3 rounded-2xl border border-gray-200 text-sm text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Status dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStatusDropdownOpen((p) => !p)}
            className={`border h-9 px-3 rounded-2xl flex items-center gap-2 text-sm cursor-pointer transition-colors select-none ${
              statusFilter !== "all"
                ? "bg-blue-500 text-white border-blue-500"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span>
              {statusFilter === "all"
                ? "Select Status"
                : STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
            </span>
            <motion.svg
              animate={{ rotate: statusDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </motion.button>

          <AnimatePresence>
            {statusDropdownOpen && (
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
                      setStatusFilter(opt.value);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.value && (
                      <Check size={13} className="text-blue-500" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-200 h-9 px-9 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-44"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={15} />
          </span>
        </div>
      </div>

      {/* Right — Filter button */}
      <div className="flex items-center gap-2 border border-gray-200 h-9 px-3 rounded-2xl text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
        <SlidersHorizontal size={15} />
        Filter
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
        <DataTable
          columns={columns}
          data={filteredItems}
          customStyles={customStyles}
          highlightOnHover
          pagination
          subHeader
          subHeaderComponent={subHeaderComponent}
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 25]}
        />
      </motion.div>
    </div>
  );
};

export default InstitutionsContractsList;
