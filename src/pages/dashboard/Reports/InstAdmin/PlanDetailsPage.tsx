import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileX,
  Sparkles,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanDetailsData {
  plan: {
    planId: number;
    planName: string;
    label: string;
    description: string;
    features: string[];
  };
  limits: {
    maxStudents: number;
    pricePerStudent: number;
    installments: number;
  };
  financial: {
    contractValue: number;
    discount: number;
    administrativeFees: number;
    tax: number;
    totalContractValue: number;
  };
  contract: {
    contractId: number;
    contractNo: string;
    instituteId: number;
    academicYear: number;
    status: string;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchPlanDetails(
  academicYear: number,
): Promise<PlanDetailsData | null> {
  try {
    const res = await dashboardApi.get(
      `/annual-settlements/institute/plan-details?academicYear=${academicYear}`,
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Skeletons ────────────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

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
                    ? "bg-blue-50 text-secondary font-semibold"
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

// ─── Stat Cell ────────────────────────────────────────────────────────────────

const StatCell = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => (
  <div className="flex flex-col gap-1 px-5 py-4">
    <p className="text-xs text-gray-400 font-medium">{label}</p>
    <p
      className={`text-base font-bold leading-tight ${
        highlight ? "text-secondary" : "text-gray-800"
      }`}
    >
      {value}
    </p>
  </div>
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
        No plan found for {year}
      </p>
      <p className="text-xs text-gray-400 max-w-xs">
        There is no active annual contract for this academic year. Try a
        different year.
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
            Try {y}
          </button>
        ))}
    </div>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const PlanDetailsPage = () => {
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["plan-details", academicYear],
    queryFn: () => fetchPlanDetails(academicYear),
    retry: false,
  });

  return (
    <>
      {/* ── Page header ── */}
      <DashboardPageTitle text="Plan Details Page" />
      {/* ── Breadcrumb ── */}
      <motion.nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
        <Link
          to="/dashboard/home"
          className="hover:text-gray-600 transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight size={13} />
        <span className="text-gray-600 font-medium">Plan Details</span>
      </motion.nav>
      <div className="flex flex-col gap-5 pb-8">
        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Sk className="h-56" />
              <div className="lg:col-span-2">
                <Sk className="h-56" />
              </div>
            </div>
            <Sk className="h-40" />
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

        {/* ── Content ── */}
        {!isLoading && !isError && data && (
          <>
            {/* ── Main card ── */}
            <motion.div
              {...fadeUp(0.06)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                {/* ── Left: plan info ── */}
                <div className="px-6 py-6 flex flex-col gap-3 bg-primary justify-center">
                  {/* Label badge */}
                  {data.plan.label && (
                    <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-secondary border border-blue-200">
                      <Sparkles size={10} />
                      {data.plan.label}
                    </span>
                  )}

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {data.plan.planName}
                    </h2>
                    {data.plan.description && (
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                        {data.plan.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Right: stats grid ── */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                    <StatCell
                      label="Max Students"
                      value={data.limits.maxStudents.toLocaleString()}
                    />
                    <StatCell
                      label="Price Per Student"
                      value={egp(data.limits.pricePerStudent)}
                    />
                    <StatCell
                      label="Installments"
                      value={data.limits.installments}
                    />
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                    <StatCell
                      label="Contract Value"
                      value={egp(data.financial.contractValue)}
                    />
                    <StatCell
                      label="Discount"
                      value={
                        data.financial.discount > 0
                          ? egp(data.financial.discount)
                          : "EGP 0"
                      }
                    />
                    <StatCell
                      label="Tax (14%)"
                      value={egp(data.financial.tax)}
                    />
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-gray-100">
                    <StatCell
                      label="Administrative Fees"
                      value={egp(data.financial.administrativeFees)}
                    />
                    {/* Total Contract Value spans 2 cols visually */}
                    <div className="col-span-2 flex flex-col gap-1 px-5 py-4 bg-primary">
                      <p className="text-xs text-gray-400 font-medium">
                        Total Contract Value
                      </p>
                      <p className="text-xl font-bold text-secondary">
                        {egp(data.financial.totalContractValue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Plan Features ── */}
            {data.plan.features.length > 0 && (
              <motion.div
                {...fadeUp(0.12)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5"
              >
                <h3 className="text-sm font-bold text-gray-800 mb-4">
                  Plan Features
                </h3>
                <div className="flex flex-col gap-2.5">
                  {data.plan.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                      className="flex items-center gap-2.5"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-green-500 flex-shrink-0"
                      />
                      <p className="text-sm text-gray-600">{feature}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PlanDetailsPage;
