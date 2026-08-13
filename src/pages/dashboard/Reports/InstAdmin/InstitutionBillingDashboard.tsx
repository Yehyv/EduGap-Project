import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Users,
  FileText,
  CalendarDays,
  AlertCircle,
  Sparkles,
  TrendingUp,
  FileX,
  ChevronRight,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InstituteSettlementData {
  currentPlan: {
    planId: number;
    planName: string;
    label: string;
    description: string;
  };
  students: {
    maxStudents: number;
    addedStudents: number;
    remainingStudents: number;
    usedPercentage: number;
    remainingPercentage: number;
  };
  contract: {
    contractId: number;
    contractNo: string;
    instituteId: number;
    instituteName: string;
    academicYear: number;
    startDate: string;
    endDate: string;
    status: string;
  };
  financial: {
    contractValue: number;
    totalPaid: number;
    remainingAmount: number;
    paymentPercentage: number;
    totalInstallments: number;
  };
  nextInstallment: {
    installmentId: number;
    installmentNo: number;
    dueDate: string;
    amount: number;
    installmentAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  } | null;
}

// ─── API ──────────────────────────────────────────────────────────────────────

// Returns null when no contract found (404 / validation error) instead of throwing
async function fetchInstituteSettlementDashboard(
  academicYear: number,
): Promise<InstituteSettlementData | null> {
  try {
    const res = await dashboardApi.get(
      `/annual-settlements/institute/dashboard?academicYear=${academicYear}`,
    );
    return res.data.data ?? null;
  } catch (err: any) {
    const messages: string[] = err?.response?.data?.message ?? [];
    const isNoContract = messages.some((m: string) =>
      m.toLowerCase().includes("no active annual contract"),
    );
    if (isNoContract) return null; // treat as "empty" not error
    throw err; // re-throw real errors
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
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

const InfoCell = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs text-gray-400 font-medium">{label}</p>
    <div className="text-sm font-semibold text-gray-800">{children}</div>
  </div>
);

const VDivider = () => (
  <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
);

// ─── Year dropdown ────────────────────────────────────────────────────────────

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
                className={`w-full px-4 py-2.5 text-sm text-left transition-colors
                  ${
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

      {/* Click-away */}
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  );
};

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
          {t("noContractFoundFor")} {year}
        </p>
        <p className="text-xs text-gray-400 max-w-xs">
          {t("noActiveAnnualContractMessage")}
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
              {t("try")} {y}
            </button>
          ))}
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const InstitutionBillingDashboard = () => {
  const { t } = useLanguage();

  const STATUS_CFG: Record<string, { cls: string; label: string }> = {
    ACTIVE: {
      cls: "bg-green-50 text-green-600 border-green-200",
      label: t("contractActive"),
    },
    CLOSED: {
      cls: "bg-gray-100 text-gray-500 border-gray-200",
      label: t("contractClosed"),
    },
    PENDING: {
      cls: "bg-amber-50 text-amber-600 border-amber-200",
      label: t("contractPending"),
    },
    OVERDUE: {
      cls: "bg-red-50 text-red-500 border-red-200",
      label: t("overdue"),
    },
    PARTIAL: {
      cls: "bg-blue-50 text-blue-500 border-blue-200",
      label: t("partial"),
    },
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CFG[status] ?? {
      cls: "bg-gray-100 text-gray-500 border-gray-200",
      label: status,
    };
    return (
      <span
        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}
      >
        {cfg.label}
      </span>
    );
  };

  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["institution-billing-dashboard", academicYear],
    queryFn: () => fetchInstituteSettlementDashboard(academicYear),
    retry: false, // don't retry on "no contract" responses
  });

  const paidPct = data?.financial.paymentPercentage ?? 0;
  const usedPct = data?.students.usedPercentage ?? 0;

  return (
    <>
      {/* ── Page header ── */}
      <DashboardPageTitle text={t("institutionBillingDashboard")} />
      {/* ── Breadcrumb ── */}
      <motion.nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
        <Link
          to="/dashboard/home"
          className="hover:text-gray-600 transition-colors"
        >
          {t("dashboard")}
        </Link>
        <ChevronRight size={13} />
        <span className="text-gray-600 font-medium">
          {t("billingDashboard")}
        </span>
      </motion.nav>
      <div className="flex flex-col gap-5 pb-8">
        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col gap-5">
            <Sk className="h-36" />
            <Sk className="h-40" />
            <div className="grid grid-cols-2 gap-5">
              <Sk className="h-32" />
              <Sk className="h-32" />
            </div>
          </div>
        )}

        {/* ── Real API error (not "no contract") ── */}
        {isError && !isLoading && (
          <motion.div
            {...fadeUp(0.05)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3"
          >
            <AlertCircle size={32} className="text-red-300" />
            <p className="text-sm text-red-400">
              {t("somethingWentWrongTryAgain")}
            </p>
          </motion.div>
        )}

        {/* ── No contract for this year ── */}
        {!isLoading && !isError && data === null && (
          <NoContractState year={academicYear} onChangeYear={setAcademicYear} />
        )}

        {/* ── Content ── */}
        {!isLoading && !isError && data && (
          <>
            {/* Plan + Students */}
            <motion.div
              {...fadeUp(0.06)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 px-6 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <Sparkles size={13} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-800">
                  {t("currentPlan")}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="px-6 py-5 flex flex-col gap-2">
                  <p className="text-xs text-gray-400 font-medium">
                    {t("plan")}
                  </p>
                  <p className="text-lg font-bold text-gray-800 leading-tight">
                    {data.currentPlan.planName}
                  </p>
                  <span className="inline-flex w-fit items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    {data.currentPlan.label}
                  </span>
                </div>

                <div className="px-6 py-5 flex flex-col gap-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Users size={11} /> {t("maxStudents")}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {data.students.maxStudents.toLocaleString()}
                  </p>
                </div>

                <div className="px-6 py-5 flex flex-col gap-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Users size={11} /> {t("addedStudents")}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {data.students.addedStudents.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-blue-500">
                    {usedPct}%
                  </p>
                </div>

                <div className="px-6 py-5 flex flex-col gap-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Users size={11} /> {t("remainingStudents")}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {data.students.remainingStudents.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-green-500">
                    {data.students.remainingPercentage}%
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contract Summary */}
            <motion.div
              {...fadeUp(0.12)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 px-6 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <FileText size={13} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-800">
                  {t("contractSummary")}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="px-6 py-5">
                  <InfoCell label={t("contractNo")}>
                    {data.contract.contractNo}
                  </InfoCell>
                </div>
                <div className="px-6 py-5">
                  <InfoCell label={t("startDate")}>
                    {fmtDate(data.contract.startDate)}
                  </InfoCell>
                </div>
                <div className="px-6 py-5">
                  <InfoCell label={t("endDate")}>
                    {fmtDate(data.contract.endDate)}
                  </InfoCell>
                </div>
                <div className="px-6 py-5">
                  <InfoCell label={t("status")}>
                    <StatusBadge status={data.contract.status} />
                  </InfoCell>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-t border-gray-100">
                <div className="px-6 py-5">
                  <InfoCell label={t("contractValue")}>
                    {egp(data.financial.contractValue)}
                  </InfoCell>
                </div>
                <div className="px-6 py-5">
                  <InfoCell label={t("totalPaid")}>
                    <span className="flex items-baseline gap-2">
                      {egp(data.financial.totalPaid)}
                      <span className="text-xs font-semibold text-blue-500">
                        {paidPct}%
                      </span>
                    </span>
                  </InfoCell>
                </div>
                <div className="px-6 py-5">
                  <InfoCell label={t("remainingAmount")}>
                    <span className="flex items-baseline gap-2">
                      {egp(data.financial.remainingAmount)}
                      <span className="text-xs font-semibold text-red-400">
                        {Math.max(0, 100 - paidPct)}%
                      </span>
                    </span>
                  </InfoCell>
                </div>
                <div className="px-6 py-5">
                  <InfoCell label={t("totalInstallments")}>
                    {data.financial.totalInstallments}
                  </InfoCell>
                </div>
              </div>
            </motion.div>

            {/* Payment % + Next Installment */}
            <motion.div
              {...fadeUp(0.18)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {/* Payment Percentage donut */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-5">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="87.96"
                      initial={{ strokeDashoffset: 87.96 }}
                      animate={{
                        strokeDashoffset:
                          87.96 - (87.96 * Math.min(paidPct, 100)) / 100,
                      }}
                      transition={{
                        delay: 0.5,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
                    {paidPct}%
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {t("paymentPercentage")}
                  </p>
                  <p className="text-3xl font-bold text-gray-800">{paidPct}%</p>
                  <p className="text-xs text-gray-400">
                    {t("ofTotalContractValue")}
                  </p>
                </div>
              </div>

              {/* Next Installment */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-gray-400" />
                  <p className="text-sm font-semibold text-gray-800">
                    {t("nextInstallment")}
                  </p>
                </div>

                {data.nextInstallment ? (
                  <>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs text-gray-400">{t("dueDate")}</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {fmtDate(data.nextInstallment.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-gray-400">
                          {t("amountDue")}
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          {egp(data.nextInstallment.remainingAmount)}
                        </p>
                      </div>
                      {/* <Link
                        to={`/dashboard/installments/${data.nextInstallment.installmentId}`}
                        className="h-9 px-4 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0"
                      >
                        View Details
                        <ArrowRight size={12} />
                      </Link> */}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-4 gap-2">
                    <TrendingUp size={24} className="text-green-200" />
                    <p className="text-xs text-gray-400">
                      {t("noUpcomingInstallments")}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </>
  );
};

export default InstitutionBillingDashboard;
