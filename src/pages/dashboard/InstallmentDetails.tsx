import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Building2,
  CalendarDays,
  DollarSign,
  Receipt,
  CreditCard,
  Eye,
  Plus,
  ArrowLeft,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Clock,
  Hash,
  Percent,
  FileText,
  Banknote,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { fetchInstallmentDetails } from "@/features/Dashboard/services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  id: number;
  payment_date: string;
  paid_amount: string;
  payment_method: string;
  receipt_no: string;
  receipt_file: string | null;
  notes: string | null;
  status: string;
  cancel_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

interface InstallmentDetailsResponse {
  contract: {
    id: number;
    contractNo: string;
    institute: {
      id: number;
      logo: string | null;
      email: string;
      phone: string;
      is_active: number;
    };
    year: number;
  };
  installment: {
    id: number;
    installmentNo: number;
    dueDate: string;
    installmentPercentage: number;
    installmentAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paidPercentage: number;
    status: string;
    notes: string | null;
  };
  payments: Payment[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { class: string; dot: string; label: string; icon: React.ReactNode }
> = {
  PAID: {
    class: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
    label: "Paid",
    icon: <CheckCircle2 size={12} />,
  },
  PARTIAL: {
    class: "bg-blue-50 text-blue-500 border-blue-200",
    dot: "bg-blue-400",
    label: "Partial",
    icon: <Clock size={12} />,
  },
  PENDING: {
    class: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-400",
    label: "Pending",
    icon: <Clock size={12} />,
  },
  UPCOMING: {
    class: "bg-orange-50 text-orange-500 border-orange-200",
    dot: "bg-orange-400",
    label: "Upcoming",
    icon: <CalendarDays size={12} />,
  },
  OVERDUE: {
    class: "bg-red-50 text-red-500 border-red-200",
    dot: "bg-red-500",
    label: "Overdue",
    icon: <AlertCircle size={12} />,
  },
  CONFIRMED: {
    class: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
    label: "Confirmed",
    icon: <CheckCircle2 size={12} />,
  },
  CANCELLED: {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    label: "Cancelled",
    icon: <XCircle size={12} />,
  },
};

const getStatusCfg = (status: string) =>
  statusConfig[status] ?? {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    label: status,
    icon: null,
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number | string) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD format matching screenshot

const fmtPaymentMethod = (method: string) =>
  method.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SummaryField = ({
  label,
  value,
  valueClass = "",
  delay = 0,
  children,
}: {
  label: string;
  value?: string | number;
  valueClass?: string;
  delay?: number;
  children?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.28 }}
    className="flex flex-col gap-1"
  >
    <p className="text-xs text-gray-400">{label}</p>
    {children ?? (
      <p className={`text-sm font-semibold text-gray-800 ${valueClass}`}>
        {value}
      </p>
    )}
  </motion.div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Custom table styles ──────────────────────────────────────────────────────

const customStyles = {
  rows: { style: { minHeight: "52px", borderBottom: "1px solid #f3f4f6" } },
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
};

// ─── Main Component ───────────────────────────────────────────────────────────

const InstallmentDetails = () => {
  const { installmentId } = useParams<{ installmentId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["installment-details", installmentId],
    queryFn: () => fetchInstallmentDetails(installmentId!),
    enabled: !!installmentId,
  });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-80" />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text="Installment Details" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-3"
        >
          <XCircle size={36} className="text-red-300" />
          <p className="text-sm font-medium text-red-400">
            Failed to load installment details. Please try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-500 hover:underline"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const { paymentHistory: payments } = data;

  const statusCfg = getStatusCfg(data?.status);

  return (
    <div className="flex flex-col gap-5 pb-8">
      <DashboardPageTitle text="Installment Details" />

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
          to={`/dashboard/installments`}
          className="hover:text-gray-600 transition-colors"
        >
          Installments
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-600">Installment Details</span>
      </motion.nav>

      {/* Contract context strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-4 px-5 py-3.5 bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Contract</p>
            <p className="text-sm font-semibold text-gray-800">
              {data?.contractNo}
            </p>
          </div>
        </div>
        <div className="w-px h-8 bg-gray-100 hidden sm:block" />
        <div>
          <p className="text-xs text-gray-400">Year</p>
          <p className="text-sm font-semibold text-gray-800">{data.year}</p>
        </div>
        <div className="w-px h-8 bg-gray-100 hidden sm:block" />
        <div>
          <p className="text-xs text-gray-400">Installment</p>
          <p className="text-sm font-semibold text-gray-800">
            {ordinal(data?.installmentNo)}
          </p>
        </div>
      </motion.div>

      {/* Installment Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.38 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <Receipt size={15} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">
            Installment Summary
          </h3>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* Row 1 — Installment No / Due Date / Amount / Status */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            <SummaryField label="Installment No." delay={0.12}>
              <p className="text-sm font-bold text-gray-800">
                {data?.installmentNo}
              </p>
            </SummaryField>

            <SummaryField label="Due Date" delay={0.15}>
              <div className="flex items-center gap-1.5">
                <CalendarDays size={13} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-800">
                  {data?.dueDate}
                </p>
              </div>
            </SummaryField>

            <SummaryField label="Installment Amount" delay={0.18}>
              <p className="text-sm font-bold text-gray-800">
                {egp(data?.installmentAmount)}
              </p>
            </SummaryField>

            <SummaryField label="Status" delay={0.21}>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border w-fit ${statusCfg.class}`}
              >
                {statusCfg.icon}
                {statusCfg.label}
              </span>
            </SummaryField>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-50" />

          {/* Row 2 — Paid / Remaining / Percentage / Notes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            <SummaryField label="Paid Amount" delay={0.24}>
              <p className="text-sm font-bold text-green-600">
                {egp(data?.paidAmount)}
              </p>
            </SummaryField>

            <SummaryField label="Remaining Amount" delay={0.27}>
              <p
                className={`text-sm font-bold ${data?.remainingAmount > 0 ? "text-red-500" : "text-gray-400"}`}
              >
                {egp(data?.remainingAmount)}
              </p>
            </SummaryField>

            <SummaryField label="Installment %" delay={0.33}>
              <div className="flex items-center gap-1">
                <Percent size={13} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-800">
                  {data?.installmentPercentage}%
                </p>
              </div>
            </SummaryField>
          </div>

          {/* Notes — only if present */}
          <AnimatePresence>
            {data?.notes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <FileText
                  size={14}
                  className="text-gray-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                  <p className="text-sm text-gray-700">{data?.notes}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.38 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <Banknote size={15} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">
            Payments Against This Installment
          </h3>
          {payments.length > 0 && (
            <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
              {payments.length}
            </span>
          )}
        </div>

        {payments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-14 gap-2 text-gray-300"
          >
            <CreditCard size={32} />
            <p className="text-sm text-gray-400">No payments recorded yet</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "#",
                    "Payment Date",
                    "Amount (EGP)",
                    "Payment Method",
                    "Receipt No.",
                    "Notes",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((pay, i) => {
                  const cfg = getStatusCfg(pay.status);
                  return (
                    <motion.tr
                      key={pay.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.25 }}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-center text-sm text-gray-500">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-gray-700 whitespace-nowrap">
                        {fmtDate(pay.paymentDate)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm font-semibold text-green-600 whitespace-nowrap">
                        {egp(pay.paidAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm text-gray-700 whitespace-nowrap">
                        {fmtPaymentMethod(pay?.paymentMethod)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          {pay.receiptNo}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm text-gray-500 max-w-[140px] truncate">
                        {pay.notes ?? "-"}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.class}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Link
                          to={`/dashboard/contract-payments/${pay.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors inline-flex"
                          title="View Payment"
                        >
                          <Eye size={15} className="text-gray-500" />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Footer actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center justify-between pt-1"
      >
        <button
          onClick={() => navigate(-1)}
          className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Back to Installments
        </button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            navigate(`/dashboard/installments/${installmentId}/create-payment`)
          }
          className="h-9 px-5 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors flex items-center gap-2"
        >
          <Plus size={15} />
          Add Payment
        </motion.button>
      </motion.div>
    </div>
  );
};

export default InstallmentDetails;
