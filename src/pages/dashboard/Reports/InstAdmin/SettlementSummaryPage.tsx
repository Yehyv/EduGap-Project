import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChevronRight,
  ChevronDown,
  AlertCircle,
  FileX,
  Info,
  Users,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettlementSummaryData {
  financial: {
    contractValue: number;
    totalPaid: number;
    remainingAmount: number;
    collectionPercentage: number;
  };
  paymentStatus: {
    paid: { amount: number; percentage: number };
    pending: { amount: number; percentage: number };
    overdue: { amount: number; percentage: number };
  };
  students: {
    maxStudents: number;
    addedStudents: number;
    remainingStudents: number;
    usagePercentage: number;
  };
  contract: {
    contractId: number;
    contractNo: string;
    instituteId: number;
    instituteName: string;
    academicYear: number;
    status: string;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchSettlementSummary(
  academicYear: number,
): Promise<SettlementSummaryData | null> {
  try {
    const res = await dashboardApi.get(
      `/annual-settlements/institute/settlement-summary?academicYear=${academicYear}`,
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
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
        className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
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
        No settlement data for {year}
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

// ─── Custom Pie Tooltip ───────────────────────────────────────────────────────

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{payload[0].name}</p>
      <p className="text-gray-500">{egp(payload[0].value)}</p>
      <p className="text-gray-400">{payload[0].payload.percentage}%</p>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const SettlementSummaryPage = () => {
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["settlement-summary", academicYear],
    queryFn: () => fetchSettlementSummary(academicYear),
    retry: false,
  });

  return (
    <>
      <DashboardPageTitle text="Institution Settlement Summary" />
      <div className="flex flex-col gap-5 pb-8">
        {/* ── Breadcrumb + Year ── */}
        <motion.div
          {...fadeUp(0)}
          className="flex items-center justify-between"
        >
          <nav className="flex items-center gap-1.5 text-sm text-gray-400">
            <Link
              to="/dashboard/billing"
              className="hover:text-gray-600 transition-colors"
            >
              Billing
            </Link>
            <ChevronRight size={13} />
            <span className="text-gray-600 font-medium">
              Settlement Summary
            </span>
          </nav>
          <YearDropdown value={academicYear} onChange={setAcademicYear} />
        </motion.div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Sk key={i} className="h-20" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Sk className="h-64" />
              <Sk className="h-64" />
            </div>
          </div>
        )}

        {/* ── Error ── */}
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
        {!isLoading &&
          !isError &&
          data &&
          (() => {
            const { financial, paymentStatus, students } = data;

            // Pie chart data — filter out 0% slices for cleaner chart
            const PIE_DATA = [
              {
                name: "Paid",
                value: paymentStatus.paid.amount,
                percentage: paymentStatus.paid.percentage,
                color: "#22c55e",
              },
              {
                name: "Pending",
                value: paymentStatus.pending.amount,
                percentage: paymentStatus.pending.percentage,
                color: "#f59e0b",
              },
              {
                name: "Overdue",
                value: paymentStatus.overdue.amount,
                percentage: paymentStatus.overdue.percentage,
                color: "#ef4444",
              },
            ].filter((d) => d.value > 0);

            return (
              <>
                {/* ── Financial KPI row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Contract Value",
                      value: egp(financial.contractValue),
                      color: "",
                    },
                    {
                      label: "Total Paid",
                      value: egp(financial.totalPaid),
                      color: "",
                    },
                    {
                      label: "Remaining Amount",
                      value: egp(financial.remainingAmount),
                      color: "",
                    },
                    {
                      label: "Collection %",
                      value: `${financial.collectionPercentage}%`,
                      color: "text-green-500",
                    },
                  ].map(({ label, value, color }, i) => (
                    <motion.div
                      key={label}
                      {...fadeUp(0.06 + i * 0.04)}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-1"
                    >
                      <p className="text-xs text-gray-400 font-medium">
                        {label}
                      </p>
                      <p
                        className={`text-xl font-bold leading-tight ${color || "text-gray-800"}`}
                      >
                        {value}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* ── Payment Status + Students Summary ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Payment Status donut */}
                  <motion.div
                    {...fadeUp(0.2)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Payment Status
                      </h3>
                    </div>

                    <div className="p-5 flex items-center gap-4">
                      {/* Donut */}
                      <div className="w-44 h-44 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={
                                PIE_DATA.length > 0
                                  ? PIE_DATA
                                  : [
                                      {
                                        name: "No data",
                                        value: 1,
                                        percentage: 0,
                                        color: "#f3f4f6",
                                      },
                                    ]
                              }
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={70}
                              paddingAngle={PIE_DATA.length > 1 ? 3 : 0}
                              dataKey="value"
                              startAngle={90}
                              endAngle={-270}
                            >
                              {(PIE_DATA.length > 0
                                ? PIE_DATA
                                : [{ color: "#f3f4f6" }]
                              ).map((entry, idx) => (
                                <Cell key={idx} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-col gap-3 flex-1">
                        {[
                          {
                            label: "Paid",
                            color: "#22c55e",
                            data: paymentStatus.paid,
                          },
                          {
                            label: "Pending",
                            color: "#f59e0b",
                            data: paymentStatus.pending,
                          },
                          {
                            label: "Overdue",
                            color: "#ef4444",
                            data: paymentStatus.overdue,
                          },
                        ].map(({ label, color, data: d }) => (
                          <div key={label} className="flex items-start gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <div className="flex flex-col gap-0">
                              <p className="text-xs font-semibold text-gray-700">
                                {label}
                              </p>
                              <p className="text-xs text-gray-400">
                                {d.percentage}% ({egp(d.amount)})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Students Summary */}
                  <motion.div
                    {...fadeUp(0.24)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Users size={13} className="text-gray-400" />
                        Students Summary
                      </h3>
                    </div>

                    <div className="px-5 py-4 flex flex-col gap-0">
                      {[
                        {
                          label: "Max Students",
                          value: students.maxStudents.toLocaleString(),
                        },
                        {
                          label: "Added Students",
                          value: students.addedStudents.toLocaleString(),
                        },
                        {
                          label: "Remaining Students",
                          value: students.remainingStudents.toLocaleString(),
                        },
                      ].map(({ label, value }, i, arr) => (
                        <div
                          key={label}
                          className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}
                        >
                          <p className="text-sm text-gray-500">{label}</p>
                          <p className="text-sm font-bold text-gray-800">
                            {value}
                          </p>
                        </div>
                      ))}

                      {/* Usage Percentage row with bar */}
                      <div className="flex flex-col gap-2 pt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            Usage Percentage
                          </p>
                          <p className="text-sm font-bold text-gray-800">
                            {students.usagePercentage}%
                          </p>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(students.usagePercentage, 100)}%`,
                            }}
                            transition={{
                              delay: 0.5,
                              duration: 0.7,
                              ease: "easeOut",
                            }}
                            className="h-full bg-green-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* ── Info notice ── */}
                <motion.div
                  {...fadeUp(0.3)}
                  className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 flex items-center gap-2.5"
                >
                  <Info size={14} className="text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Please keep your payments up to date to avoid any service
                    interruption.
                  </p>
                </motion.div>
              </>
            );
          })()}
      </div>
    </>
  );
};

export default SettlementSummaryPage;
