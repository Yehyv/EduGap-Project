import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Banknote,
  FileText,
  Building2,
  Hash,
  User,
  Clock,
  ImageIcon,
  RefreshCw,
  XCircle,
  BadgeCheck,
  DollarSign,
  Landmark,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { fetchPaymentDetails } from "@/features/Dashboard/services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentInstallment {
  id: number;
  installmentNo: number;
  dueDate: string;
  installmentAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
}

interface PaymentCreatedBy {
  id: number;
  fullName: string;
}

interface PaymentDetail {
  id: number;
  paymentId: number;
  contractId: number;
  contractNo: string | null;
  instituteId: number;
  installment: PaymentInstallment;
  paymentDate: string;
  amount: number;
  paidAmount: number;
  paymentMethod: string;
  receiptNo: string;
  receiptFile: string | null;
  notes: string | null;
  status: string;
  isReversal: boolean;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdBy: PaymentCreatedBy;
  cancelledBy: PaymentCreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const paymentStatusConfig: Record<
  string,
  { class: string; dot: string; label: string; icon: React.ReactNode }
> = {
  CONFIRMED: {
    class: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
    label: "Confirmed",
    icon: <BadgeCheck size={13} className="text-green-500" />,
  },
  PENDING: {
    class: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-400",
    label: "Pending",
    icon: <Clock size={13} className="text-amber-500" />,
  },
  CANCELLED: {
    class: "bg-red-50 text-red-500 border-red-200",
    dot: "bg-red-500",
    label: "Cancelled",
    icon: <XCircle size={13} className="text-red-500" />,
  },
  REVERSED: {
    class: "bg-purple-50 text-purple-500 border-purple-200",
    dot: "bg-purple-400",
    label: "Reversed",
    icon: <RefreshCw size={13} className="text-purple-400" />,
  },
};

const installmentStatusConfig: Record<
  string,
  { class: string; dot: string; label: string }
> = {
  PAID: {
    class: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
    label: "Paid",
  },
  PARTIAL: {
    class: "bg-blue-50 text-blue-500 border-blue-200",
    dot: "bg-blue-400",
    label: "Partial",
  },
  PENDING: {
    class: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-400",
    label: "Pending",
  },
  UPCOMING: {
    class: "bg-orange-50 text-orange-500 border-orange-200",
    dot: "bg-orange-400",
    label: "Upcoming",
  },
  OVERDUE: {
    class: "bg-red-50 text-red-500 border-red-200",
    dot: "bg-red-500",
    label: "Overdue",
  },
};

const getPaymentStatusCfg = (s: string) =>
  paymentStatusConfig[s] ?? {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    label: s,
    icon: null,
  };

const getInstallmentStatusCfg = (s: string) =>
  installmentStatusConfig[s] ?? {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    label: s,
  };

// ─── Payment method labels ────────────────────────────────────────────────────

const PAYMENT_METHOD_LABELS: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  BANK_TRANSFER: {
    label: "Bank Transfer",
    icon: <Landmark size={13} className="text-blue-400" />,
  },
  CASH: {
    label: "Cash",
    icon: <DollarSign size={13} className="text-green-400" />,
  },
  CHEQUE: {
    label: "Cheque",
    icon: <FileText size={13} className="text-amber-400" />,
  },
  ONLINE: {
    label: "Online",
    icon: <CreditCard size={13} className="text-purple-400" />,
  },
};

const getMethodInfo = (m: string) =>
  PAYMENT_METHOD_LABELS[m] ?? {
    label: m,
    icon: <Banknote size={13} className="text-gray-400" />,
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number | string) =>
  `EGP ${Number(val).toLocaleString("en-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso: string) => iso?.split("T")[0] ?? iso;

const fmtDateTime = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" })
  );
};

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

const SectionCard = ({
  icon,
  title,
  badge,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {badge}
    </div>
    <div className="px-5 py-5">{children}</div>
  </motion.div>
);

const DetailRow = ({
  label,
  value,
  highlight,
  valueNode,
}: {
  label: string;
  value?: string | number;
  highlight?: "green" | "red" | "blue";
  valueNode?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <p className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</p>
    {valueNode ?? (
      <p
        className={`text-sm font-semibold text-right ${
          highlight === "green"
            ? "text-green-600"
            : highlight === "red"
              ? "text-red-500"
              : highlight === "blue"
                ? "text-blue-600"
                : "text-gray-800"
        }`}
      >
        {value ?? "—"}
      </p>
    )}
  </div>
);

const StatusBadge = ({
  cfg,
}: {
  cfg: { class: string; dot: string; label: string; icon?: React.ReactNode };
}) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.class}`}
  >
    {cfg.icon ?? <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
    {cfg.label}
  </span>
);

const PaymentDetailsPage = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [imgModalOpen, setImgModalOpen] = useState(false);

  const {
    data: payment,
    isLoading,
    isError,
  } = useQuery<PaymentDetail>({
    queryKey: ["payment-details", paymentId],
    queryFn: () => fetchPaymentDetails(paymentId!),
    enabled: !!paymentId,
  });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Skeleton className="h-72" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !payment) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text="Payment Details" />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={36} className="text-red-300" />
          <p className="text-sm text-red-400">
            Failed to load payment details.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-500 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const paymentStatusCfg = getPaymentStatusCfg(payment.status);
  const installmentStatusCfg = getInstallmentStatusCfg(
    payment.installment.status,
  );
  const methodInfo = getMethodInfo(payment.paymentMethod);

  const installmentPaidPct =
    payment.installment.installmentAmount > 0
      ? Math.round(
          (payment.installment.paidAmount /
            payment.installment.installmentAmount) *
            100,
        )
      : 0;

  return (
    <>
      {/* Receipt image modal */}
      <AnimatePresence>
        {imgModalOpen && payment.receiptFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setImgModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  Receipt Image
                </p>
                <button
                  onClick={() => setImgModalOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <XCircle size={15} className="text-gray-400" />
                </button>
              </div>
              <img
                src={payment.receiptFile}
                alt="Receipt"
                className="w-full object-contain max-h-[70vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-5 pb-8">
        <DashboardPageTitle text="Payment Details" />

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
            to="/dashboard/contract-payments"
            className="hover:text-gray-600 transition-colors"
          >
            Payments
          </Link>

          <ChevronRight size={14} />
          <span className="text-gray-600">Payment Details</span>
        </motion.nav>

        <Link
          to={`/dashboard/contract-payments/${paymentId}/cancel`}
          className="flex ms-auto text-white bg-red-500 px-6 py-1.5 rounded-xl font-bold"
        >
          Cancel / Reverse
        </Link>

        {/* Header summary bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <CreditCard size={18} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment ID</p>
              <p className="text-sm font-bold text-gray-800">#{payment.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center sm:text-right">
              <p className="text-xs text-gray-400">Amount</p>
              <p className="text-lg font-bold text-gray-900">
                {egp(payment.amount)}
              </p>
            </div>
            <div className="h-8 w-px bg-gray-100 hidden sm:block" />
            <StatusBadge cfg={paymentStatusCfg} />
            {payment.isReversal && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-purple-50 text-purple-600 border-purple-200">
                <RefreshCw size={11} />
                Reversal
              </span>
            )}
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Installment info */}
            <SectionCard
              icon={<Hash size={15} />}
              title="Installment"
              badge={<StatusBadge cfg={installmentStatusCfg} />}
              delay={0.06}
            >
              <div className="flex flex-col">
                <DetailRow
                  label="Installment No."
                  value={ordinal(payment.installment.installmentNo)}
                />
                <DetailRow
                  label="Due Date"
                  value={fmtDate(payment.installment.dueDate)}
                />
                <DetailRow
                  label="Total Amount"
                  value={egp(payment.installment.installmentAmount)}
                />
                <DetailRow
                  label="Paid Amount"
                  value={egp(payment.installment.paidAmount)}
                  highlight="green"
                />
                <DetailRow
                  label="Remaining"
                  value={egp(payment.installment.remainingAmount)}
                  highlight={
                    payment.installment.remainingAmount > 0 ? "red" : undefined
                  }
                />

                {/* Installment progress bar */}
                <div className="flex flex-col gap-1.5 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Paid Progress</p>
                    <p className="text-xs font-semibold text-gray-600">
                      {installmentPaidPct}%
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(installmentPaidPct, 100)}%`,
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
            </SectionCard>

            {/* Contract info */}
            <SectionCard
              icon={<Building2 size={15} />}
              title="Contract"
              delay={0.1}
            >
              <div className="flex flex-col">
                <DetailRow label="Contract ID" value={payment.contractId} />
                <DetailRow
                  label="Contract No."
                  value={payment.contractNo ?? "—"}
                />
                <DetailRow label="Institute ID" value={payment.instituteId} />
              </div>
            </SectionCard>

            {/* Audit */}
            <SectionCard
              icon={<Clock size={15} />}
              title="Audit Trail"
              delay={0.14}
            >
              <div className="flex flex-col">
                <DetailRow
                  label="Created By"
                  valueNode={
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={10} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {payment.createdBy.fullName}
                      </span>
                    </div>
                  }
                />
                <DetailRow
                  label="Created At"
                  value={fmtDateTime(payment.createdAt)}
                />
                <DetailRow
                  label="Updated At"
                  value={fmtDateTime(payment.updatedAt)}
                />
                {payment.cancelledBy && (
                  <DetailRow
                    label="Cancelled By"
                    valueNode={
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                          <User size={10} className="text-red-400" />
                        </div>
                        <span className="text-sm font-semibold text-red-600">
                          {payment.cancelledBy.fullName}
                        </span>
                      </div>
                    }
                  />
                )}
                {payment.cancelledAt && (
                  <DetailRow
                    label="Cancelled At"
                    value={fmtDateTime(payment.cancelledAt)}
                  />
                )}
              </div>
            </SectionCard>
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Payment details */}
            <SectionCard
              icon={<CreditCard size={15} />}
              title="Payment Details"
              delay={0.08}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {/* Left col */}
                <div className="flex flex-col">
                  <DetailRow
                    label="Payment ID"
                    value={`#${payment.paymentId}`}
                  />
                  <DetailRow
                    label="Payment Date"
                    value={fmtDate(payment.paymentDate)}
                  />
                  <DetailRow
                    label="Method"
                    valueNode={
                      <div className="flex items-center gap-1.5">
                        {methodInfo.icon}
                        <span className="text-sm font-semibold text-gray-800">
                          {methodInfo.label}
                        </span>
                      </div>
                    }
                  />
                  <DetailRow
                    label="Receipt No."
                    value={payment.receiptNo ?? "—"}
                    highlight={payment.receiptNo ? "blue" : undefined}
                  />
                </div>
                {/* Right col */}
                <div className="flex flex-col">
                  <DetailRow
                    label="Amount"
                    value={egp(payment.amount)}
                    highlight="green"
                  />
                  <DetailRow
                    label="Paid Amount"
                    value={egp(payment.paidAmount)}
                    highlight="green"
                  />
                  <DetailRow
                    label="Status"
                    valueNode={<StatusBadge cfg={paymentStatusCfg} />}
                  />
                  <DetailRow
                    label="Reversal"
                    valueNode={
                      payment.isReversal ? (
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">
                          No
                        </span>
                      )
                    }
                  />
                </div>
              </div>
            </SectionCard>

            {/* Notes */}
            <SectionCard
              icon={<FileText size={15} />}
              title="Notes"
              delay={0.12}
            >
              {payment.notes ? (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {payment.notes}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No notes recorded for this payment.
                </p>
              )}
            </SectionCard>

            {/* Cancel reason (only when applicable) */}
            {payment.cancelReason && (
              <SectionCard
                icon={<XCircle size={15} />}
                title="Cancellation Reason"
                delay={0.14}
              >
                <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle
                    size={13}
                    className="text-red-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-700">{payment.cancelReason}</p>
                </div>
              </SectionCard>
            )}

            {/* Receipt image */}
            <SectionCard
              icon={<ImageIcon size={15} />}
              title="Receipt Image"
              badge={
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {payment.receiptFile ? "Attached" : "Not attached"}
                </span>
              }
              delay={0.16}
            >
              {payment.receiptFile ? (
                <motion.div
                  className="rounded-xl overflow-hidden border border-gray-200 cursor-pointer group relative"
                  onClick={() => setImgModalOpen(true)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                >
                  <img
                    src={payment.receiptFile}
                    alt="Receipt"
                    className="w-full max-h-52 object-contain bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-white bg-black/50 px-3 py-1.5 rounded-full">
                      Click to enlarge
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2.5 h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon size={16} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-400">
                    No receipt image was attached to this payment.
                  </p>
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex pt-1"
        >
          <button
            onClick={() => navigate(-1)}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default PaymentDetailsPage;
