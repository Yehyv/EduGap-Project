import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Bell,
  CalendarDays,
  CreditCard,
  ListChecks,
  AlertCircle,
  CheckCircle2,
  FileX,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NextInstallmentData {
  hasNextInstallment: boolean;
  nextInstallment: {
    installmentId: number;
    installmentNo: number;
    label: string;
    dueDate: string;
    amount: number;
    installmentAmount: number;
    paidAmount: number;
    remainingAmount: number;
    daysLeft: number;
    status: string;
  } | null;
  progress: {
    daysLeft: number;
    progressPercentage: number;
  };
  actions: {
    payNow: boolean;
    viewInstallments: boolean;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchNextInstallment(
  academicYear: number,
): Promise<NextInstallmentData | null> {
  try {
    const res = await dashboardApi.get(
      `/annual-settlements/institute/next-installment?academicYear=${academicYear}`,
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
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Year Dropdown ────────────────────────────────────────────────────────────

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
                className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
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
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

// ─── No Contract ─────────────────────────────────────────────────────────────

const NoContractState = ({
  year,
  onChangeYear,
}: {
  year: number;
  onChangeYear: (y: number) => void;
}) => (
  <motion.div
    {...fadeUp(0.05)}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 gap-4"
  >
    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
      <FileX size={28} className="text-gray-300" />
    </div>
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-sm font-semibold text-gray-700">
        No contract for {year}
      </p>
      <p className="text-xs text-gray-400 max-w-xs">
        There is no active annual contract for this academic year.
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
            className="h-8 px-4 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Try {y}
          </button>
        ))}
    </div>
  </motion.div>
);

// ─── All Paid State ───────────────────────────────────────────────────────────

const AllPaidState = () => (
  <motion.div
    {...fadeUp(0.05)}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 gap-4"
  >
    <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
      <CheckCircle2 size={28} className="text-green-400" />
    </div>
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-sm font-semibold text-gray-700">
        All installments paid!
      </p>
      <p className="text-xs text-gray-400 max-w-xs">
        You have no upcoming installments for this academic year. Great job!
      </p>
    </div>
    <Link
      to="/dashboard/billing/installments"
      className="h-9 px-5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
    >
      <ListChecks size={14} />
      View All Installments
    </Link>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const NextInstallmentPage = () => {
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["next-installment", academicYear],
    queryFn: () => fetchNextInstallment(academicYear),
    retry: false,
  });

  const inst = data?.nextInstallment;
  const progress = data?.progress;
  const actions = data?.actions;

  // urgency colour for the days-left bar & text
  const daysLeft = progress?.daysLeft ?? 0;
  const barColor =
    daysLeft <= 7
      ? "bg-red-400"
      : daysLeft <= 30
        ? "bg-amber-400"
        : "bg-amber-400";
  const textColor =
    daysLeft <= 7
      ? "text-red-500"
      : daysLeft <= 30
        ? "text-amber-600"
        : "text-gray-700";

  return (
    <div className="flex flex-col gap-5">
      {/* ── Breadcrumb + Year ── */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-sm text-gray-400">
          <Link
            to="/dashboard/home"
            className="hover:text-gray-600 transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight size={13} />
          <span className="text-gray-600 font-medium">Next Installment</span>
        </nav>
        <YearDropdown value={academicYear} onChange={setAcademicYear} />
      </motion.div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
          <Sk className="h-64" />
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
            Something went wrong. Please try again.
          </p>
        </motion.div>
      )}

      {/* ── No contract ── */}
      {!isLoading && !isError && data === null && (
        <NoContractState year={academicYear} onChangeYear={setAcademicYear} />
      )}

      {/* ── No next installment (all paid) ── */}
      {!isLoading && !isError && data && !data.hasNextInstallment && (
        <AllPaidState />
      )}

      {/* ── Main card ── */}
      {!isLoading && !isError && data?.hasNextInstallment && inst && (
        <motion.div {...fadeUp(0.06)} className="mx-auto w-full ">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col gap-6 px-20">
            {/* ── Header ── */}
            <div className="flex flex-col items-center gap-2 text-center">
              {/* Bell icon in amber circle */}
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-1">
                <Bell size={26} className="text-amber-500 fill-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                Next Installment Reminder!
              </h2>
              <p className="text-sm text-gray-500">
                Your next installment is due soon.
              </p>
            </div>

            {/* ── Info card ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                {/* Installment */}
                <div className="px-5 py-4 flex flex-col gap-1">
                  <p className="text-xs text-gray-400 font-medium">
                    Installment
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {inst.label}
                  </p>
                </div>

                {/* Due Date */}
                <div className="px-5 py-4 flex flex-col gap-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <CalendarDays size={10} /> Due Date
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {fmtDate(inst.dueDate)}
                  </p>
                </div>

                {/* Amount */}
                <div className="px-5 py-4 flex flex-col gap-1">
                  <p className="text-xs text-gray-400 font-medium">Amount</p>
                  <p className="text-sm font-bold text-gray-800">
                    {egp(inst.remainingAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Progress bar ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
              <p className={`text-sm font-medium ${textColor}`}>
                You have <span className="font-bold">{daysLeft} days</span> left
                to pay this installment.
              </p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(progress?.progressPercentage ?? 0, 100)}%`,
                  }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${barColor}`}
                />
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center justify-center gap-3">
              {actions?.payNow && (
                <Link
                  to={`/dashboard/billing/installments/${inst.installmentId}/pay`}
                  className="h-10 px-7 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <CreditCard size={14} />
                  Pay Now
                </Link>
              )}
              {actions?.viewInstallments && (
                <Link
                  to="/dashboard/billing/installments"
                  className="h-10 px-7 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <ListChecks size={14} />
                  View Installments
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NextInstallmentPage;
