import { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscriptionPlan {
  id: number;
  name: string;
  badge: string;
  badgeColor: string;
  minStudents: number;
  maxStudents: number | string;
  pricePerStudent: number | string;
  installments: number | string;
  status: "Active" | "Inactive";
  institutes: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_PLANS: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Starter Plan",
    badge: "Basic",
    badgeColor: "bg-blue-100 text-blue-600",
    minStudents: 0,
    maxStudents: 500,
    pricePerStudent: "200.00",
    installments: 4,
    status: "Active",
    institutes: 3,
  },
  {
    id: 2,
    name: "Growth Plan",
    badge: "Popular",
    badgeColor: "bg-green-100 text-green-600",
    minStudents: 501,
    maxStudents: 2000,
    pricePerStudent: "180.00",
    installments: 4,
    status: "Active",
    institutes: 6,
  },
  {
    id: 3,
    name: "Enterprise Plan",
    badge: "Enterprise",
    badgeColor: "bg-orange-100 text-orange-600",
    minStudents: 2001,
    maxStudents: 10000,
    pricePerStudent: "150.00",
    installments: 4,
    status: "Active",
    institutes: 2,
  },
  {
    id: 4,
    name: "Custom Plan",
    badge: "Custom",
    badgeColor: "bg-purple-100 text-purple-600",
    minStudents: 10001,
    maxStudents: "Unlimited",
    pricePerStudent: "Custom",
    installments: "Custom",
    status: "Active",
    institutes: 1,
  },
];

// ─── Summary stats ────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total Plans",
    value: 4,
    bg: "bg-blue-50",
    iconBg: "bg-blue-500",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
        <rect x="13" y="3" width="8" height="8" rx="2" fill="white" />
        <rect x="3" y="13" width="8" height="8" rx="2" fill="white" />
        <rect x="13" y="13" width="8" height="8" rx="2" fill="white" />
      </svg>
    ),
  },
  {
    label: "Active Plans",
    value: 4,
    bg: "bg-green-50",
    iconBg: "bg-green-500",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
        <path
          d="M8 12l3 3 5-5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Inactive Plans",
    value: 0,
    bg: "bg-orange-50",
    iconBg: "bg-orange-400",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
        <path
          d="M12 8v4m0 4h.01"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Institutes Using Plans",
    value: 12,
    bg: "bg-violet-50",
    iconBg: "bg-violet-500",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path
          d="M3 21h18M5 21V9l7-6 7 6v12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="9"
          y="14"
          width="6"
          height="7"
          rx="1"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    ),
  },
];

// ─── Custom Styles ────────────────────────────────────────────────────────────

const customStyles = {
  rows: {
    style: { minHeight: "56px", borderBottom: "1px solid #f3f4f6" },
  },
  subHeader: {
    style: {
      borderRadius: "12px 12px 0 0",
      paddingLeft: "0",
      paddingRight: "0",
    },
  },
  headRow: {
    style: { backgroundColor: "#f9fafb", borderRadius: "0" },
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

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns = [
  {
    name: "#",
    selector: (_: unknown, index: number) => index + 1,
    width: "60px",
    center: true,
  },
  {
    name: "Plan Name",
    cell: (row: SubscriptionPlan) => (
      <div className="flex flex-col gap-0.5 py-1">
        <span className="font-semibold text-gray-800 text-sm">{row.name}</span>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full w-fit ${row.badgeColor}`}
        >
          {row.badge}
        </span>
      </div>
    ),
    sortable: true,
    minWidth: "160px",
  },
  {
    name: "Min Students",
    selector: (row: SubscriptionPlan) => row.minStudents,
    sortable: true,
    center: true,
  },
  {
    name: "Max Students",
    selector: (row: SubscriptionPlan) => row.maxStudents,
    sortable: true,
    center: true,
  },
  {
    name: "Price Per Student (EGP)",
    selector: (row: SubscriptionPlan) => row.pricePerStudent,
    sortable: true,
    center: true,
    minWidth: "180px",
  },
  {
    name: "Installments",
    selector: (row: SubscriptionPlan) => row.installments,
    sortable: true,
    center: true,
  },
  {
    name: "Status",
    cell: (row: SubscriptionPlan) => (
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
          row.status === "Active"
            ? "bg-green-50 text-green-600"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            row.status === "Active" ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        {row.status}
      </span>
    ),
    sortable: true,
    center: true,
  },
  {
    name: "Institutes",
    selector: (row: SubscriptionPlan) => row.institutes,
    sortable: true,
    center: true,
  },
  {
    name: "Actions",
    cell: (row: SubscriptionPlan) => (
      <div className="flex items-center gap-2">
        <Link
          to={`/dashboard/subscription-plans/${row.id}`}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="View"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="#6b7280"
              strokeWidth="2"
            />
            <circle cx="12" cy="12" r="3" stroke="#6b7280" strokeWidth="2" />
          </svg>
        </Link>
        <Link
          to={`/dashboard/subscription-plans/edit/${row.id}`}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="Edit"
        >
          <EditIcon />
        </Link>
        <button
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="More"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" fill="#6b7280" />
            <circle cx="12" cy="12" r="1.5" fill="#6b7280" />
            <circle cx="12" cy="19" r="1.5" fill="#6b7280" />
          </svg>
        </button>
      </div>
    ),
    ignoreRowClick: true,
    center: true,
    minWidth: "120px",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const SubscriptionPlans = () => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(
    () =>
      DUMMY_PLANS.filter((plan) =>
        plan.name.toLowerCase().includes(filterText.toLowerCase()),
      ),
    [filterText],
  );

  const subHeaderComponent = (
    <div className="flex gap-2 w-full justify-between items-center px-1 py-2">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by title"
          className="border border-gray-200 h-9 px-10 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
      </div>
      <div className="border border-gray-200 h-9 px-4 rounded-2xl flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
        <FilterIcon />
        Filter
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageTitle
        text="Subscription Plans List"
        button
        buttonText={
          <Link
            to="/dashboard/subscription-plans/add-new-plan"
            className="flex items-center"
          >
            <PlusIcon className="mt-1.5 h-8" />
            <span className="me-4 text-white">Add New Plan</span>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${stat.bg} border border-white`}
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 leading-tight">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-white">
        <DataTable
          columns={columns}
          data={filteredItems}
          customStyles={customStyles}
          highlightOnHover
          pagination
          subHeader
          subHeaderComponent={subHeaderComponent}
        />
      </div>
    </div>
  );
};

export default SubscriptionPlans;
