import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Clock,
  ChevronRight,
  XCircle,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { fetchUpgradeRequests } from "@/features/Dashboard/services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpgradeRequest {
  id: number;
  instituteId: number;
  instituteName: string;
  currentContractId: number;
  currentPlanId: number;
  currentPlanName: string;
  requestedPlanId: number;
  requestedPlanName: string;
  reason: string;
  additionalStudentsNeeded: number;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statusConfig: Record<
  string,
  { class: string; dot: string; label: string }
> = {
  PENDING: {
    class: "bg-amber-50 text-amber-600 border-amber-200 text-nowrap",
    dot: "bg-amber-400",
    label: "Pending",
  },
  APPROVED: {
    class: "bg-green-50 text-green-600 border-green-200 text-nowrap",
    dot: "bg-green-500",
    label: "Approved",
  },
  REJECTED: {
    class: "bg-red-50 text-red-500 border-red-200 text-nowrap",
    dot: "bg-red-400",
    label: "Rejected",
  },
};

const getStatusCfg = (status: string) =>
  statusConfig[status] ?? {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    label: status,
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

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

// ─── Main Component ───────────────────────────────────────────────────────────

const UpgradePlanRequests = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // ── Upgrade requests query ─────────────────────────────────────────────────
  const {
    data: requestsData,
    isLoading,
    isError: listError,
  } = useQuery({
    queryKey: ["plan-upgrade-requests", page, perPage],
    queryFn: () => fetchUpgradeRequests(page, perPage),
  });

  const requests: UpgradeRequest[] = requestsData?.data ?? [];

  const pagination: ApiPagination | undefined = requestsData?.meta;

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      name: "#",
      selector: (_: unknown, index: number) => (page - 1) * perPage + index + 1,
      width: "60px",
      center: true,
    },
    {
      name: "Institute",
      selector: (row: UpgradeRequest) => row.instituteName,
      cell: (row: UpgradeRequest) => (
        <div className="text-center">
          <p className="font-semibold text-gray-800">{row.instituteName}</p>
          <p className="text-[11px] text-gray-400">ID #{row.instituteId}</p>
        </div>
      ),
      sortable: true,
      minWidth: "160px",
    },
    {
      name: "Plan Change",
      cell: (row: UpgradeRequest) => (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-gray-500">{row.currentPlanName}</span>
          <ArrowUpRight size={14} className="text-blue-500 flex-shrink-0" />
          <span className="font-semibold text-gray-800">
            {row.requestedPlanName}
          </span>
        </div>
      ),
      minWidth: "180px",
      center: true,
    },
    {
      name: "Additional Students",
      selector: (row: UpgradeRequest) => row.additionalStudentsNeeded,
      cell: (row: UpgradeRequest) => (
        <span className="font-semibold text-gray-800">
          {row.additionalStudentsNeeded.toLocaleString()}
        </span>
      ),
      sortable: true,
      center: true,
      minWidth: "100px",
    },
    {
      name: "Reason",
      selector: (row: UpgradeRequest) => row.reason,
      cell: (row: UpgradeRequest) => (
        <span
          className="text-gray-600 truncate block max-w-[160px]"
          title={row.reason}
        >
          {row.reason}
        </span>
      ),
      minWidth: "160px",
      center: true,
    },
    {
      name: "Status",
      cell: (row: UpgradeRequest) => {
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
      name: "Submitted",
      selector: (row: UpgradeRequest) => row.createdAt,
      cell: (row: UpgradeRequest) => (
        <span className="text-gray-600">{fmtDate(row.createdAt)}</span>
      ),
      sortable: true,
      center: true,
      minWidth: "110px",
    },
    {
      name: "Details",
      selector: (row: UpgradeRequest) => row.createdAt,
      cell: (row: UpgradeRequest) => (
        <Link to={`/dashboard/upgrade-plan-requests/${row.id}`}>
          <Eye className="text-secondary" />
        </Link>
      ),
      sortable: true,
      center: true,
      minWidth: "110px",
    },
  ];

  // ── Sub-header ─────────────────────────────────────────────────────────────

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
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
        <DashboardPageTitle text="Plan Upgrade Requests" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-3"
        >
          <XCircle size={36} className="text-red-300" />
          <p className="text-sm font-medium text-red-400">
            Failed to load upgrade requests.
          </p>
          <Link
            to="/dashboard/home"
            className="text-sm text-blue-500 hover:underline"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageTitle text="Plan Upgrade Requests" />

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

        <span className="text-gray-600">Plan Upgrade Requests</span>
      </motion.nav>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Requests"
          value={pagination ? String(pagination.total) : "-"}
          icon={<ClipboardList size={20} />}
          borderColor="border-l-blue-400"
          delay={0.05}
        />
        <StatCard
          label="Pending on This Page"
          value={String(pendingCount)}
          subColor="bg-amber-100 text-amber-700"
          icon={<Clock size={20} className="text-amber-500" />}
          borderColor="border-l-amber-400"
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
          data={requests}
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
        />
      </motion.div>
    </div>
  );
};

export default UpgradePlanRequests;
