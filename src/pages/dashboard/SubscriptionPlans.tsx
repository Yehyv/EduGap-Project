import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Building2,
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Loader2,
  Check,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import {
  deleteInstitute,
  deletePlan,
  fetchPlans,
  fetchPlansCount,
  planActivateToggle,
  totalActivePlans,
  totalInActivePlans,
  totalInstitutesUsingPlans,
} from "@/features/Dashboard/services/dashboardApis";
import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscriptionPlan {
  id: number;
  plan_name: string;
  min_students: number;
  max_students: number;
  default_price_per_student: number;
  default_installments_count: number;
  description: string;
  administrative_fees: number;
  is_active: 0 | 1;
  institutesCount: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

type ActiveFilter = "all" | "active" | "inactive";

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

// ─── Badge helper ─────────────────────────────────────────────────────────────

const getBadge = (plan: SubscriptionPlan) => {
  if (plan.max_students <= 100)
    return { label: "Basic", color: "bg-blue-100 text-blue-600" };
  if (plan.max_students <= 1000)
    return { label: "Popular", color: "bg-green-100 text-green-600" };
  if (plan.max_students <= 5000)
    return { label: "Enterprise", color: "bg-orange-100 text-orange-600" };
  return { label: "Custom", color: "bg-purple-100 text-purple-600" };
};

// ─── Filter options ───────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: ActiveFilter; label: string; dot: string }[] = [
  { value: "all", label: "All Plans", dot: "bg-gray-400" },
  { value: "active", label: "Active", dot: "bg-green-500" },
  { value: "inactive", label: "Inactive", dot: "bg-gray-400" },
];

// ─── Columns ──────────────────────────────────────────────────────────────────

const buildColumns = () => [
  {
    name: "#",
    selector: (_: unknown, index: number) => index + 1,
    width: "60px",
    center: true,
  },
  {
    name: "Plan Name",
    cell: (row: SubscriptionPlan) => {
      const badge = getBadge(row);
      return (
        <div className="flex flex-col items-center gap-0.5 py-1">
          <span className="font-semibold text-gray-800 text-sm">
            {row.plan_name}
          </span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full w-fit ${badge.color}`}
          >
            {badge.label}
          </span>
        </div>
      );
    },
    sortable: false,
    minWidth: "160px",
    ignoreRowClick: true,
  },
  {
    name: "Min Students",
    selector: (row: SubscriptionPlan) => row.min_students,
    sortable: true,
    center: true,
  },
  {
    name: "Max Students",
    selector: (row: SubscriptionPlan) => row.max_students,
    sortable: true,
    center: true,
  },
  {
    name: "Price Per Student (EGP)",
    selector: (row: SubscriptionPlan) => row.default_price_per_student,
    sortable: true,
    center: true,
    minWidth: "180px",
  },
  {
    name: "Administrative Fees",
    selector: (row: SubscriptionPlan) => row.administrative_fees,
    sortable: true,
    center: true,
    minWidth: "180px",
  },
  {
    name: "Installments",
    selector: (row: SubscriptionPlan) => row.default_installments_count,
    sortable: true,
    center: true,
  },

  {
    name: "Institutes",
    selector: (row: SubscriptionPlan) => row.institutesCount,
    sortable: true,
    center: true,
  },
  {
    name: "Status",
    cell: (row: SubscriptionPlan) => (
      <ActiveStatusButton
        itemId={row.id ?? ""}
        activateApi={() => planActivateToggle(row.id ?? "")}
        deactivateApi={() => planActivateToggle(row.id ?? "")}
        isActive={row.is_active ?? false}
        refetchKey={[
          "subscription-plans",
          "totalActivePlans",
          "totalInActivePlans",
        ]}
        showModal={false}
      />
    ),

    sortable: false,
    ignoreRowClick: true,
    center: true,
  },
  {
    name: "Edit",
    cell: (row: SubscriptionPlan) => (
      <Link
        to={`/dashboard/subscription-plans/edit/${row.id}`}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        title="Edit"
      >
        <EditIcon />
      </Link>
    ),
    ignoreRowClick: true,
    center: true,
    minWidth: "50px",
  },
  {
    name: "Delete",
    cell: (row: SubscriptionPlan) => (
      <DeleteButton
        deleteApi={() => deletePlan(row.id)}
        successMessage="Plan has been deleted successfully"
        errorMessage="An error occurred while deleting the plan"
        refetchFunction="subscription-plans"
      />
    ),
    ignoreRowClick: true,
    center: true,
    minWidth: "50px",
  },
  {
    name: "View",
    cell: (row: SubscriptionPlan) => (
      <Link
        to={`/dashboard/subscription-plans/${row.id}`}
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

// ─── Main Component ───────────────────────────────────────────────────────────

const SubscriptionPlans = () => {
  const [filterText, setFilterText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Read active filter from search params: "all" | "active" | "inactive"
  const activeFilter = (searchParams.get("status") as ActiveFilter) ?? "all";

  // Only pass onlyActive=1 to API when filter is "active"
  const onlyActive = activeFilter === "active";

  const setActiveFilter = (value: ActiveFilter) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") {
      next.delete("status");
    } else {
      next.set("status", value);
    }
    setSearchParams(next);
    setDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const {
    data: plansData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subscription-plans", onlyActive],
    queryFn: () => fetchPlans(onlyActive),
  });

  const { data: totalPlansCount = [] } = useQuery({
    queryKey: ["totalPlansCount"],
    queryFn: () => fetchPlansCount(),
  });
  const { data: totalActivePlansCount = [] } = useQuery({
    queryKey: ["totalActivePlans"],
    queryFn: () => totalActivePlans(),
  });
  const { data: totalInActivePlansCount = [] } = useQuery({
    queryKey: ["totalInActivePlans"],
    queryFn: () => totalInActivePlans(),
  });
  const { data: totalInstitutesUsingPlansCount = [] } = useQuery({
    queryKey: ["totalInstitutesUsingPlans"],
    queryFn: () => totalInstitutesUsingPlans(),
  });

  const plans = plansData?.data ?? [];

  // Client-side inactive filter (API has no onlyInactive param)
  const statusFilteredPlans = useMemo(() => {
    if (activeFilter === "inactive") return plans.filter((p) => !p.is_active);
    return plans;
  }, [plans, activeFilter]);

  // Derived stats always from full unfiltered data
  const totalPlans = totalPlansCount?.data?.totalPlans;
  const activePlans = totalActivePlansCount?.data?.totalActivePlans;
  const inactivePlans = totalInActivePlansCount?.data?.totalInactivePlans;
  const totalInstitutes =
    totalInstitutesUsingPlansCount?.data?.totalInstitutesUsingPlans;

  const STATS = [
    {
      label: "Total Plans",
      value: totalPlans,
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
      icon: <LayoutGrid size={20} color="white" />,
    },
    {
      label: "Active Plans",
      value: activePlans,
      bg: "bg-green-50",
      iconBg: "bg-green-500",
      icon: <CheckCircle2 size={20} color="white" />,
    },
    {
      label: "Inactive Plans",
      value: inactivePlans,
      bg: "bg-orange-50",
      iconBg: "bg-orange-400",
      icon: <XCircle size={20} color="white" />,
    },
    {
      label: "Institutes Using Plans",
      value: totalInstitutes,
      bg: "bg-violet-50",
      iconBg: "bg-violet-500",
      icon: <Building2 size={20} color="white" />,
    },
  ];

  const filteredItems = useMemo(
    () =>
      statusFilteredPlans?.filter((plan) =>
        plan.plan_name.toLowerCase().includes(filterText.toLowerCase()),
      ),
    [statusFilteredPlans, filterText],
  );

  const currentOption = FILTER_OPTIONS.find((o) => o.value === activeFilter)!;
  const isFiltered = activeFilter !== "all";

  const subHeaderComponent = (
    <div className="flex gap-2 w-full justify-between items-center px-1 py-2">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by title"
          className="border border-gray-200 h-9 px-10 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </span>
      </div>

      {/* Filter Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`border h-9 px-4 rounded-2xl flex items-center gap-2 text-sm cursor-pointer transition-colors select-none ${
            isFiltered
              ? "bg-blue-500 text-white border-blue-500"
              : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal size={15} />
          <span>{isFiltered ? currentOption.label : "Filter"}</span>
          {/* Animated chevron */}
          <motion.svg
            animate={{ rotate: dropdownOpen ? 180 : 0 }}
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
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute end-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <div className="py-1.5">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setActiveFilter(option.value)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${option.dot}`} />
                      {option.label}
                    </div>
                    {activeFilter === option.value && (
                      <Check size={14} className="text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        <AnimatePresence>
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35, ease: "easeOut" }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${stat.bg} border border-white`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                {stat.icon}
              </div>
              <div>
                <motion.p
                  key={stat.value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl font-bold text-gray-800"
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs text-gray-500 leading-tight">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-white"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading plans...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16 text-red-400 gap-2">
            <XCircle size={20} />
            <span className="text-sm">Failed to load plans. Try again.</span>
          </div>
        ) : (
          <DataTable
            columns={buildColumns()}
            data={filteredItems}
            customStyles={customStyles}
            highlightOnHover
            pagination
            subHeader
            subHeaderComponent={subHeaderComponent}
          />
        )}
      </motion.div>
    </div>
  );
};

export default SubscriptionPlans;
