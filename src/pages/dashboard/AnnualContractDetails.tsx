import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Printer,
  ChevronDown,
  Building2,
  CalendarDays,
  UserCircle,
  Clock,
  DollarSign,
  FileCheck2,
  CreditCard,
  GraduationCap,
  FolderOpen,
  AlertCircle,
  Users,
  Receipt,
  CheckCircle2,
  AlarmClock,

} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { fetchContractById } from "@/features/Dashboard/services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContractDetailResponse {
  id: number;
  contractNo: string;
  instituteName: string;
  academicYear: number;
  planName: string;
  maxStudents: number;
  status: string;
  paidAmount: number;
  totalRemaining: number;
  header: {
    contractNo: string;
    institute: { id: number; name: string };
    status: string;
    academicYear: number;
    plan: { id: number; name: string };
    maxStudents: number;
  };
  tabs: {
    contractInfo: boolean;
    installments: number;
    payments: number;
    students: number;
    documents: number;
  };
  contractInfo: {
    pricePerStudent: number;
    packageAmount: number;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    amountAfterDiscount: number;
    administrativeFees: number;
    taxPercentage: number;
    taxAmount: number;
    totalAmount: number;
    installmentsCount: number;
    startDate: string;
    endDate: string;
    notes: string;
    createdBy: { id: number; fullName: string; role: string | null };
    createdAt: string;
  };
  studentsUsage: {
    maxStudentsAllowed: number;
    addedStudents: number;
    remainingStudents: number;
  };
  settlement: {
    totalAmount: number;
    totalPaid: number;
    totalRemaining: number;
    paymentPercentage: number;
    overdueInstallments: number;
  };
  installments: {
    id: number;
    installmentNo: number;
    dueDate: string;
    installmentPercentage: number;
    installmentAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    notes: string | null;
  }[];
  payments: {
    id: number;
    installmentId: number;
    paymentDate: string;
    paidAmount: number;
    paymentMethod: string;
    receiptNo: string;
    receiptFile: string | null;
    status: string;
    notes: string | null;
    createdBy: { id: number; fullName: string };
    createdAt: string;
  }[];
  notes: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  amountAfterDiscount: number;
  administrativeFees: number;
  taxPercentage: number;
  taxAmount: number;
  contractStartDate: string;
  contractEndDate: string;
  createdBy: { id: number; fullName: string; role: string | null };
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { class: string; dot: string; label: string }
> = {
  ACTIVE: {
    class: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
    label: "Active",
  },
  DRAFT: {
    class: "bg-blue-50 text-blue-500 border-blue-200",
    dot: "bg-blue-400",
    label: "Draft",
  },
  CLOSED: {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    label: "Closed",
  },
  PENDING: {
    class: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-400",
    label: "Pending",
  },
  PAID: {
    class: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
    label: "Paid",
  },
  OVERDUE: {
    class: "bg-red-50 text-red-500 border-red-200",
    dot: "bg-red-500",
    label: "Overdue",
  },
  CONFIRMED: {
    class: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
    label: "Confirmed",
  },
};

const getStatusCfg = (status: string) =>
  statusConfig[status] ?? {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    label: status,
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number) =>
  `EGP ${Number(val).toLocaleString("en-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const StatCard = ({
  label,
  value,
  sub,
  color,
  icon,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color}`}
  >
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </motion.div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AnnualContractDetails = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [activeTab, setActiveTab] = useState("info");
  const [moreOpen, setMoreOpen] = useState(false);

  const {
    data: contract,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["institute-annual-contract", contractId],
    queryFn: () => fetchContractById(contractId!),
    enabled: !!contractId,
  });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !contract) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text="Annual Contract Details" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-3"
        >
          <AlertCircle size={36} className="text-red-300" />
          <p className="text-sm font-medium text-red-400">
            Failed to load contract. Please try again.
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

  const headerStatusCfg = getStatusCfg(contract.header.status);

  // ── Dynamic tabs from API ──────────────────────────────────────────────────
  const TABS = [
    {
      key: "info",
      label: "Contract Info",
      icon: <FileCheck2 size={14} />,
      count: undefined,
    },
    {
      key: "installments",
      label: "Installments",
      icon: <CreditCard size={14} />,
      count: contract.tabs.installments,
    },
    {
      key: "payments",
      label: "Payments",
      icon: <DollarSign size={14} />,
      count: contract.tabs.payments,
    },
    {
      key: "students",
      label: "Students",
      icon: <GraduationCap size={14} />,
      count: contract.tabs.students,
    },
    {
      key: "documents",
      label: "Documents",
      icon: <FolderOpen size={14} />,
      count: contract.tabs.documents,
    },
  ];

  const info = contract.contractInfo;

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
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building2 size={24} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {contract.header.institute.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-400">
                  Contract #{contract.header.contractNo}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${headerStatusCfg.class}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${headerStatusCfg.dot}`}
                  />
                  {headerStatusCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Right — Key stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <p className="text-xs text-gray-400">Year</p>
              <p className="font-bold text-gray-800 text-base">
                {contract.header.academicYear}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <p className="text-xs text-gray-400">Plan</p>
              <p className="font-bold text-gray-800">
                {contract.header.plan.name}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <p className="text-xs text-gray-400">Max Students</p>
              <p className="font-bold text-gray-800">
                {contract.header.maxStudents.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Settlement + Students usage strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-50">
          <StatCard
            label="Total Amount"
            value={egp(contract.settlement.totalAmount)}
            color="bg-blue-50 border-blue-100"
            icon={<Receipt size={18} className="text-blue-400" />}
            delay={0.12}
          />
          <StatCard
            label="Total Paid"
            value={egp(contract.settlement.totalPaid)}
            sub={`${contract.settlement.paymentPercentage}% paid`}
            color="bg-green-50 border-green-100"
            icon={<CheckCircle2 size={18} className="text-green-500" />}
            delay={0.16}
          />
          <StatCard
            label="Remaining"
            value={egp(contract.settlement.totalRemaining)}
            sub={
              contract.settlement.overdueInstallments > 0
                ? `${contract.settlement.overdueInstallments} overdue`
                : undefined
            }
            color={
              contract.settlement.overdueInstallments > 0
                ? "bg-red-50 border-red-100"
                : "bg-gray-50 border-gray-100"
            }
            icon={
              <AlarmClock
                size={18}
                className={
                  contract.settlement.overdueInstallments > 0
                    ? "text-red-400"
                    : "text-gray-400"
                }
              />
            }
            delay={0.2}
          />
          <StatCard
            label="Students"
            value={`${contract.studentsUsage.addedStudents} / ${contract.studentsUsage.maxStudentsAllowed}`}
            sub={`${contract.studentsUsage.remainingStudents} remaining`}
            color="bg-violet-50 border-violet-100"
            icon={<Users size={18} className="text-violet-400" />}
            delay={0.24}
          />
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
        <div className="flex items-center border-b border-gray-100 px-2 overflow-x-auto">
          {TABS.map((tab) => (
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
              {tab.count !== undefined && tab.count > 0 && (
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
            {/* ── Contract Info ── */}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                  <div>
                    <InfoRow
                      label="Price Per Student (EGP)"
                      value={egp(info.pricePerStudent)}
                      delay={0.05}
                    />
                    <InfoRow
                      label="Package Amount"
                      value={egp(info.packageAmount)}
                      delay={0.08}
                    />
                    <InfoRow
                      label={`Discount (${info.discountType === "PERCENTAGE" ? `${info.discountValue}%` : "Fixed"})`}
                      value={egp(info.discountAmount)}
                      delay={0.11}
                    />
                    <InfoRow
                      label="Amount After Discount"
                      value={egp(info.amountAfterDiscount)}
                      delay={0.14}
                    />
                    <InfoRow
                      label="Administrative Fees"
                      value={egp(info.administrativeFees)}
                      delay={0.17}
                    />
                  </div>
                  <div>
                    <InfoRow
                      label={`Tax (${info.taxPercentage}%)`}
                      value={egp(info.taxAmount)}
                      delay={0.05}
                    />
                    <InfoRow
                      label="Total Amount"
                      value={egp(info.totalAmount)}
                      bold
                      delay={0.08}
                    />
                    <InfoRow
                      label="Installments Count"
                      value={String(info.installmentsCount)}
                      delay={0.11}
                    />
                    {info.notes && (
                      <InfoRow label="Notes" value={info.notes} delay={0.14} />
                    )}
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
                    value={fmtDate(info.startDate)}
                    delay={0.32}
                  />
                  <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                  <MetaCard
                    icon={<CalendarDays size={16} />}
                    label="End Date"
                    value={fmtDate(info.endDate)}
                    delay={0.36}
                  />
                  <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                  <MetaCard
                    icon={<UserCircle size={16} />}
                    label="Created By"
                    value={info.createdBy.fullName}
                    delay={0.4}
                  />
                  <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                  <MetaCard
                    icon={<Clock size={16} />}
                    label="Created At"
                    value={fmtDateTime(info.createdAt)}
                    delay={0.44}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* ── Installments ── */}
            {activeTab === "installments" && (
              <motion.div
                key="installments"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <p className="text-sm font-semibold text-gray-800 mb-4">
                  Installments
                </p>
                {contract.installments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-300">
                    <CreditCard size={36} />
                    <p className="text-sm text-gray-400">No installments yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {contract.installments.map((inst, i) => {
                      const cfg = getStatusCfg(inst.status);
                      return (
                        <motion.div
                          key={inst.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.28 }}
                          className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-600">
                                #{inst.installmentNo}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {egp(inst.installmentAmount)}
                              </p>
                              <p className="text-xs text-gray-400">
                                Due: {fmtDate(inst.dueDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-right">
                              <p className="text-xs text-gray-400">Paid</p>
                              <p className="font-semibold text-green-600">
                                {egp(inst.paidAmount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">Remaining</p>
                              <p
                                className={`font-semibold ${inst.remainingAmount > 0 ? "text-red-500" : "text-gray-400"}`}
                              >
                                {egp(inst.remainingAmount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">%</p>
                              <p className="font-semibold text-gray-700">
                                {inst.installmentPercentage}%
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cfg.class}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                              />
                              {cfg.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Payments ── */}
            {activeTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <p className="text-sm font-semibold text-gray-800 mb-4">
                  Payments
                </p>
                {contract.payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-300">
                    <DollarSign size={36} />
                    <p className="text-sm text-gray-400">No payments yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {contract.payments.map((pay, i) => {
                      const cfg = getStatusCfg(pay.status);
                      return (
                        <motion.div
                          key={pay.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.28 }}
                          className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2
                                size={16}
                                className="text-green-500"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {egp(pay.paidAmount)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {fmtDate(pay.paymentDate)} · Receipt:{" "}
                                {pay.receiptNo}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-right">
                              <p className="text-xs text-gray-400">Method</p>
                              <p className="font-medium text-gray-700 text-xs">
                                {pay.paymentMethod.replace("_", " ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">By</p>
                              <p className="font-medium text-gray-700 text-xs">
                                {pay.createdBy.fullName}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cfg.class}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                              />
                              {cfg.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Students ── */}
            {activeTab === "students" && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-300">
                  <GraduationCap size={36} />
                  <p className="text-sm text-gray-400">No students added yet</p>
                </div>
              </motion.div>
            )}

            {/* ── Documents ── */}
            {activeTab === "documents" && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-300">
                  <FolderOpen size={36} />
                  <p className="text-sm text-gray-400">No documents yet</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AnnualContractDetails;
