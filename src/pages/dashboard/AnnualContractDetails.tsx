import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Printer,
  ChevronDown,
  Building2,
  CalendarDays,
  FileText,
  Users,
  UserCircle,
  Clock,
  DollarSign,
  Receipt,
  Percent,
  BadgeCheck,
  FileCheck2,
  CreditCard,
  GraduationCap,
  FolderOpen,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContractDetails {
  id: number;
  contractNumber: string;
  institute: string;
  status: "Active" | "Closed" | "Pending";
  year: number;
  plan: string;
  maxStudents: number;
  pricePerStudent: number;
  packageAmount: number;
  discountPct: number;
  discountAmount: number;
  amountAfterDiscount: number;
  administrativeFees: number;
  taxPct: number;
  taxAmount: number;
  totalAmount: number;
  installments: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_CONTRACTS: Record<string, ContractDetails> = {
  "1": {
    id: 1,
    contractNumber: "CON-2025-0001",
    institute: "Almarefa Institute",
    status: "Active",
    year: 2025,
    plan: "Growth Plan",
    maxStudents: 2000,
    pricePerStudent: 180,
    packageAmount: 360000,
    discountPct: 10,
    discountAmount: 36000,
    amountAfterDiscount: 324000,
    administrativeFees: 5000,
    taxPct: 14,
    taxAmount: 46000,
    totalAmount: 375060,
    installments: 4,
    startDate: "2025-01-10",
    endDate: "2025-12-31",
    createdBy: "SUPER_ADMIN",
    createdAt: "2025-01-10 11:30 AM",
  },
  "2": {
    id: 2,
    contractNumber: "CON-2025-0002",
    institute: "Attamia Institute",
    status: "Active",
    year: 2025,
    plan: "Starter Plan",
    maxStudents: 500,
    pricePerStudent: 200,
    packageAmount: 100000,
    discountPct: 0,
    discountAmount: 0,
    amountAfterDiscount: 100000,
    administrativeFees: 0,
    taxPct: 14,
    taxAmount: 14000,
    totalAmount: 114000,
    installments: 4,
    startDate: "2025-02-01",
    endDate: "2025-12-31",
    createdBy: "SUPER_ADMIN",
    createdAt: "2025-02-01 09:00 AM",
  },
  "3": {
    id: 3,
    contractNumber: "CON-2025-0003",
    institute: "Future Academy",
    status: "Active",
    year: 2025,
    plan: "Enterprise Plan",
    maxStudents: 5000,
    pricePerStudent: 150,
    packageAmount: 750000,
    discountPct: 10,
    discountAmount: 75000,
    amountAfterDiscount: 675000,
    administrativeFees: 0,
    taxPct: 14,
    taxAmount: 94500,
    totalAmount: 769500,
    installments: 6,
    startDate: "2025-01-15",
    endDate: "2025-12-31",
    createdBy: "SUPER_ADMIN",
    createdAt: "2025-01-15 10:15 AM",
  },
  "4": {
    id: 4,
    contractNumber: "CON-2024-0004",
    institute: "Smart Learning Institute",
    status: "Closed",
    year: 2024,
    plan: "Growth Plan",
    maxStudents: 1500,
    pricePerStudent: 180,
    packageAmount: 270000,
    discountPct: 0,
    discountAmount: 0,
    amountAfterDiscount: 270000,
    administrativeFees: 0,
    taxPct: 14,
    taxAmount: 37800,
    totalAmount: 307800,
    installments: 4,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdBy: "SUPER_ADMIN",
    createdAt: "2024-01-01 08:00 AM",
  },
};

const TABS = [
  { key: "info", label: "Contract Info", icon: <FileCheck2 size={14} /> },
  {
    key: "installments",
    label: "Installments",
    count: 4,
    icon: <CreditCard size={14} />,
  },
  {
    key: "payments",
    label: "Payments",
    count: 3,
    icon: <DollarSign size={14} />,
  },
  {
    key: "students",
    label: "Students",
    count: 450,
    icon: <GraduationCap size={14} />,
  },
  { key: "documents", label: "Documents", icon: <FolderOpen size={14} /> },
];

const statusConfig = {
  Active: {
    class: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
  },
  Closed: {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
  Pending: {
    class: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-400",
  },
};

// ─── Info Grid Row ────────────────────────────────────────────────────────────

const InfoRow = ({
  label,
  value,
  bold,
  delay = 0,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.28 }}
    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
  >
    <span className="text-sm text-gray-500">{label}</span>
    <span
      className={`text-sm ${bold ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}
    >
      {value}
    </span>
  </motion.div>
);

// ─── Meta Card ────────────────────────────────────────────────────────────────

const MetaCard = ({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="flex items-center gap-3 flex-1 min-w-0"
  >
    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  </motion.div>
);

// ─── Empty Tab Placeholder ────────────────────────────────────────────────────

const EmptyTab = ({ label }: { label: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 gap-2 text-gray-300"
  >
    <FolderOpen size={36} />
    <p className="text-sm text-gray-400">No {label} data yet</p>
  </motion.div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AnnualContractDetails = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [activeTab, setActiveTab] = useState("info");
  const [moreOpen, setMoreOpen] = useState(false);

  const contract = DUMMY_CONTRACTS[contractId ?? "1"] ?? DUMMY_CONTRACTS["1"];
  const statusCfg = statusConfig[contract.status];
  const egp = (val: number) => `EGP ${val.toLocaleString("en-EG")}`;

  // Resolve tab counts dynamically
  const tabs = TABS.map((t) => {
    if (t.key === "installments") return { ...t, count: contract.installments };
    return t;
  });

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Page Title */}
      <div className="flex items-center justify-between gap-4">
        <DashboardPageTitle text="Annual Contract Details" />
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Printer size={15} />
            Print
          </motion.button>

          {/* More dropdown */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setMoreOpen((p) => !p)}
              className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              More
              <motion.span
                animate={{ rotate: moreOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.span>
            </motion.button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
                >
                  {["Edit Contract", "Download PDF", "Duplicate", "Delete"].map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setMoreOpen(false)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          item === "Delete"
                            ? "text-red-500 hover:bg-red-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

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
        <Link
          to="/dashboard/institutions-contracts"
          className="hover:text-gray-600 transition-colors"
        >
          Contracts
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-600">Contract Details</span>
      </motion.nav>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.38 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left — Institute info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building2 size={24} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {contract.institute}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-400">
                  Contract #{contract.contractNumber}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.class}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                  />
                  {contract.status}
                </span>
              </div>
            </div>
          </div>

          {/* Right — Key stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <p className="text-xs text-gray-400">Year</p>
              <p className="font-bold text-gray-800 text-base">
                {contract.year}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <p className="text-xs text-gray-400">Plan</p>
              <p className="font-bold text-gray-800">{contract.plan}</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <p className="text-xs text-gray-400">Max Students</p>
              <p className="font-bold text-gray-800">
                {contract.maxStudents.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs + Content */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.38 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-gray-100 px-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span
                className={
                  activeTab === tab.key ? "text-blue-500" : "text-gray-400"
                }
              >
                {tab.icon}
              </span>
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <p className="text-sm font-semibold text-gray-800 mb-4">
                  Contract Information
                </p>

                {/* Two-column info grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                  {/* Left */}
                  <div>
                    <InfoRow
                      label="Price Per Student (EGP)"
                      value={`${contract.pricePerStudent}.00`}
                      delay={0.05}
                    />
                    <InfoRow
                      label="Package Amount"
                      value={egp(contract.packageAmount)}
                      delay={0.08}
                    />
                    <InfoRow
                      label="Discount (%)"
                      value={`${contract.discountPct}%`}
                      delay={0.11}
                    />
                    <InfoRow
                      label="Discount Amount"
                      value={egp(contract.discountAmount)}
                      delay={0.14}
                    />
                    <InfoRow
                      label="Amount After Discount"
                      value={egp(contract.amountAfterDiscount)}
                      delay={0.17}
                    />
                  </div>

                  {/* Right */}
                  <div>
                    <InfoRow
                      label="Administrative Fees"
                      value={egp(contract.administrativeFees)}
                      delay={0.05}
                    />
                    <InfoRow
                      label="Tax (%)"
                      value={`${contract.taxPct}%`}
                      delay={0.08}
                    />
                    <InfoRow
                      label="Tax Amount"
                      value={egp(contract.taxAmount)}
                      delay={0.11}
                    />
                    <InfoRow
                      label="Total Amount"
                      value={egp(contract.totalAmount)}
                      bold
                      delay={0.14}
                    />
                    <InfoRow
                      label="Installments"
                      value={String(contract.installments)}
                      delay={0.17}
                    />
                  </div>
                </div>

                {/* Meta row */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-6"
                >
                  <MetaCard
                    icon={<CalendarDays size={16} />}
                    label="Start Date"
                    value={contract.startDate}
                    delay={0.32}
                  />
                  <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                  <MetaCard
                    icon={<CalendarDays size={16} />}
                    label="End Date"
                    value={contract.endDate}
                    delay={0.36}
                  />
                  <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                  <MetaCard
                    icon={<UserCircle size={16} />}
                    label="Created By"
                    value={contract.createdBy}
                    delay={0.4}
                  />
                  <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                  <MetaCard
                    icon={<Clock size={16} />}
                    label="Created At"
                    value={contract.createdAt}
                    delay={0.44}
                  />
                </motion.div>
              </motion.div>
            )}

            {activeTab === "installments" && (
              <motion.div
                key="installments"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <EmptyTab label="installments" />
              </motion.div>
            )}

            {activeTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <EmptyTab label="payments" />
              </motion.div>
            )}

            {activeTab === "students" && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <EmptyTab label="students" />
              </motion.div>
            )}

            {activeTab === "documents" && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <EmptyTab label="documents" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AnnualContractDetails;
