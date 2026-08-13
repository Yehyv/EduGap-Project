import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Building2,
  AlertCircle,
  FileX,
  Info,
  ChevronRight,
  ListChecks,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MyContractData {
  contractId: number;
  instituteId: number;
  academicYear: number;
  planId: number;
  planName: string;
  maxStudentsAllowed: number;
  addedStudents: number;
  remainingStudents: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  paymentPercentage: number;
  contractStatus: string;
  settlementStatus: string;
  overdueInstallments: number;
  contract: {
    contractId: number;
    contractNo: string;
    instituteId: number;
    instituteName: string;
    academicYear: number;
    planId: number;
    planName: string;
    status: string;
    contractStartDate: string;
    contractEndDate: string;
  };
  contractSummary: {
    maxStudentsAllowed: number;
    addedStudents: number;
    remainingStudents: number;
    pricePerStudent: number;
    packageAmount: number;
    discountAmount: number;
    amountAfterDiscount: number;
    administrativeFees: number;
    taxAmount: number;
    netAmount: number;
  };
  paymentSummary: {
    totalInstallments: number;
    paidInstallments: number;
    partialInstallments: number;
    pendingInstallments: number;
    overdueInstallments: number;
    lastPaymentDate: string | null;
    lastPaymentAmount: number | null;
    lastPaymentMethod: string | null;
  };
  collectionProgress: {
    percentage: number;
    collected: number;
    remaining: number;
  };
  installments: {
    id: number;
    installmentId: number;
    installmentNo: number;
    dueDate: string;
    installmentAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  }[];
  payments: {
    id: number;
    paymentId: number;
    installmentId: number;
    paymentDate: string;
    paidAmount: number;
    paymentMethod: string;
    receiptNo: string | null;
    status: string;
    createdAt: string;
  }[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchMyContract(
  academicYear: number,
): Promise<MyContractData | null> {
  try {
    const res = await dashboardApi.get(
      `/annual-settlements/institute/current?academicYear=${academicYear}`,
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

const STATUS_CFG: Record<string, { cls: string; label: string }> = {
  ACTIVE: {
    cls: "bg-green-50 text-green-600 border-green-200",
    label: "Active",
  },
  CLOSED: {
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    label: "Closed",
  },
  PENDING: {
    cls: "bg-amber-50 text-amber-600 border-amber-200",
    label: "Pending",
  },
  OVERDUE: {
    cls: "bg-red-50 text-red-500 border-red-200",
    label: "Overdue",
  },
  PAID: {
    cls: "bg-green-50 text-green-600 border-green-200",
    label: "Paid",
  },
  PARTIALLY_PAID: {
    cls: "bg-blue-50 text-blue-500 border-blue-200",
    label: "Partially Paid",
  },
  CONFIRMED: {
    cls: "bg-green-50 text-green-600 border-green-200",
    label: "Confirmed",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
  valueColor?: string;
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <p
      className={`text-sm ${bold ? "font-bold text-gray-800" : "text-gray-500"}`}
    >
      {label}
    </p>
    <p
      className={`text-sm ${bold ? "font-bold text-gray-800" : "font-semibold text-gray-800"} ${valueColor ?? ""}`}
    >
      {value}
    </p>
  </div>
);

// ─── No Contract state ────────────────────────────────────────────────────────

const NoContractState = ({
  year,
  onChangeYear,
}: {
  year: number;
  onChangeYear: (y: number) => void;
}) => {
  const { t } = useLanguage();

  return (
    <motion.div
      {...fadeUp(0.05)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 gap-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
        <FileX size={28} className="text-gray-300" />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold text-gray-700">
          {t("No contract found for")} {year}
        </p>

        <p className="text-xs text-gray-400 max-w-xs">
          {t(
            "There is no active annual contract for this academic year. Try selecting a different year.",
          )}
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
              className="h-8 px-4 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {t("Try")} {y}
            </button>
          ))}
      </div>
    </motion.div>
  );
};
const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status] ?? {
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}
    >
      {" "}
      {cfg.label}{" "}
    </span>
  );
};
// ─── Page ─────────────────────────────────────────────────────────────────────

const MyContractPage = () => {
  const { t } = useLanguage();

  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-contract", academicYear],
    queryFn: () => fetchMyContract(academicYear),
    retry: false,
  });

  return (
    <>
      <DashboardPageTitle text={t("My Contract")} />

      {/* ── Breadcrumb ── */}
      <motion.nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
        <Link
          to="/dashboard/home"
          className="hover:text-gray-600 transition-colors"
        >
          {t("Dashboard")}
        </Link>

        <ChevronRight size={13} />

        <span className="text-gray-600 font-medium">{t("My Contract")}</span>
      </motion.nav>

      <div className="flex flex-col gap-5 pb-8">
        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col gap-5">
            <Sk className="h-24" />
            <Sk className="h-72" />
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
              {t("Something went wrong. Please try again.")}
            </p>
          </motion.div>
        )}

        {/* ── No contract ── */}
        {!isLoading && !isError && data === null && (
          <NoContractState year={academicYear} onChangeYear={setAcademicYear} />
        )}

        {/* ── Content ── */}
        {!isLoading &&
          !isError &&
          data &&
          (() => {
            const {
              contract,
              contractSummary,
              paymentSummary,
              collectionProgress,
            } = data;

            return (
              <>
                {/* ── Contract header card ── */}
                <motion.div
                  {...fadeUp(0.06)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} className="text-gray-400" />
                    </div>

                    {/* Contract No + Status */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">
                        {t("Contract No.")}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-lg font-bold text-gray-800 font-mono">
                          {contract.contractNo}
                        </p>

                        <StatusBadge status={contract.status} />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-12 bg-gray-100" />

                    {/* Academic Year */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <p className="text-xs text-gray-400 font-medium">
                        {t("Academic Year")}
                      </p>

                      <p className="text-lg font-bold text-gray-800">
                        {contract.academicYear}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-12 bg-gray-100" />

                    {/* Plan */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <p className="text-xs text-gray-400 font-medium">
                        {t("Plan")}
                      </p>

                      <p className="text-lg font-bold text-gray-800">
                        {contract.planName}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* ── Contract Information + Financial Summary ── */}
                <motion.div
                  {...fadeUp(0.1)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <p className="text-sm font-semibold text-gray-800">
                      {t("Contract Information")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                    {/* Left — contract details */}
                    <div className="px-6 py-4">
                      <InfoRow
                        label={t("Start Date")}
                        value={fmtDate(contract.contractStartDate)}
                      />

                      <InfoRow
                        label={t("End Date")}
                        value={fmtDate(contract.contractEndDate)}
                      />

                      <InfoRow
                        label={t("Max Students")}
                        value={contractSummary.maxStudentsAllowed.toLocaleString()}
                      />

                      <InfoRow
                        label={t("Price Per Student")}
                        value={egp(contractSummary.pricePerStudent)}
                      />

                      <InfoRow
                        label={t("Installments")}
                        value={paymentSummary.totalInstallments}
                      />

                      <InfoRow
                        label={t("Tax (14%)")}
                        value={egp(contractSummary.taxAmount)}
                      />

                      <InfoRow
                        label={t("Administrative Fees")}
                        value={egp(contractSummary.administrativeFees)}
                      />
                    </div>

                    {/* Right — financial summary */}
                    <div className="px-6 py-4">
                      <InfoRow
                        label={t("Contract Value")}
                        value={egp(contractSummary.packageAmount)}
                      />

                      <InfoRow
                        label={t("Discount")}
                        value={
                          contractSummary.discountAmount > 0
                            ? `- ${egp(contractSummary.discountAmount)}`
                            : "EGP 0"
                        }
                        valueColor="text-blue-500"
                      />

                      <InfoRow
                        label={t("Total Contract Value")}
                        value={egp(contractSummary.netAmount)}
                        bold
                      />

                      <InfoRow
                        label={t("Total Paid")}
                        value={egp(data.totalPaid)}
                        valueColor="text-green-600"
                      />

                      <InfoRow
                        label={t("Remaining Amount")}
                        value={egp(data.totalRemaining)}
                        valueColor="text-red-400"
                      />

                      <div className="flex items-center justify-between py-2.5">
                        <p className="text-sm text-gray-500">
                          {t("Payment Percentage")}
                        </p>

                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(
                                  collectionProgress.percentage,
                                  100,
                                )}%`,
                              }}
                              transition={{
                                delay: 0.5,
                                duration: 0.7,
                                ease: "easeOut",
                              }}
                              className="h-full bg-blue-500 rounded-full"
                            />
                          </div>

                          <p className="text-sm font-semibold text-gray-800">
                            {collectionProgress.percentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── Info notice + View Installments ── */}
                <motion.div
                  {...fadeUp(0.16)}
                  className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <Info
                      size={15}
                      className="text-blue-400 flex-shrink-0 mt-0.5"
                    />

                    <p className="text-sm text-secondary">
                      {t(
                        "You can add students until you reach your plan limit.",
                      )}{" "}
                      <span className="font-semibold">
                        {contractSummary.remainingStudents.toLocaleString()}{" "}
                        {t("spots remaining.")}
                      </span>
                    </p>
                  </div>

                  <Link
                    to={`/dashboard/installment-schedule`}
                    className="h-9 px-5 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    <ListChecks size={14} />
                    {t("View Installments")}
                  </Link>
                </motion.div>
              </>
            );
          })()}
      </div>
    </>
  );
};

export default MyContractPage;
