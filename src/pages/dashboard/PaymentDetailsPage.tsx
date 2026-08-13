import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  CheckCircle2,
  StickyNote,
  Loader2,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  fetchPaymentDetails,
  approvePayment,
} from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

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

// ─── Approve Panel ────────────────────────────────────────────────────────────

const ApprovePanel = ({
  paymentId,
  onSuccess,
}: {
  paymentId: string;
  onSuccess: () => void;
}) => {
  const { t } = useLanguage();
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: () => approvePayment(paymentId, { reviewNotes: notes }),
    onSuccess,
  });

  const handleApprove = () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    mutate();
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-2 py-6"
      >
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={22} className="text-green-500" />
        </div>
        <p className="text-sm font-semibold text-green-600">
          {t("paymentApproved")}
        </p>
        <p className="text-xs text-gray-400 text-center">
          {t("paymentConfirmedSuccessfully")}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Notes field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
          <StickyNote size={12} className="text-gray-400" />
          {t("reviewNotes")}
          <span className="text-gray-400 font-normal">({t("optional")})</span>
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("addNotesAboutApproval")}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white
            focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400
            transition-colors resize-none"
        />
      </div>

      {/* Confirmation warning — shown after first click */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <AlertCircle
              size={13}
              className="text-amber-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-amber-700 leading-relaxed">
              {t("approvePaymentConfirmMessage")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {isError && (
        <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
          <XCircle size={12} /> {t("failedToApproveTryAgain")}
        </p>
      )}

      {/* Approve button */}
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        className={`h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed
          ${
            confirmed
              ? "bg-green-600 hover:bg-green-700 shadow-md shadow-green-200"
              : "bg-green-500 hover:bg-green-600"
          }`}
      >
        {isPending ? (
          <>
            <Loader2 size={15} className="animate-spin" /> {t("approving")}
          </>
        ) : (
          <>
            <CheckCircle2 size={15} />{" "}
            {confirmed ? t("confirmApproval") : t("approvePayment")}
          </>
        )}
      </button>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const PaymentDetailsPage = () => {
  const { t } = useLanguage();
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imgModalOpen, setImgModalOpen] = useState(false);

  const paymentStatusConfig: Record<
    string,
    { class: string; dot: string; label: string; icon: React.ReactNode }
  > = {
    CONFIRMED: {
      class: "bg-green-50 text-green-600 border-green-200",
      dot: "bg-green-500",
      label: t("confirmed"),
      icon: <BadgeCheck size={13} className="text-green-500" />,
    },
    PENDING_REVIEW: {
      class: "bg-amber-50 text-amber-600 border-amber-200",
      dot: "bg-amber-400",
      label: t("pending"),
      icon: <Clock size={13} className="text-amber-500" />,
    },
    CANCELLED: {
      class: "bg-red-50 text-red-500 border-red-200",
      dot: "bg-red-500",
      label: t("cancelled"),
      icon: <XCircle size={13} className="text-red-500" />,
    },
    REVERSED: {
      class: "bg-purple-50 text-purple-500 border-purple-200",
      dot: "bg-purple-400",
      label: t("reversed"),
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
      label: t("paid"),
    },
    PARTIAL: {
      class: "bg-blue-50 text-blue-500 border-blue-200",
      dot: "bg-blue-400",
      label: t("partial"),
    },
    PENDING_REVIEW: {
      class: "bg-amber-50 text-amber-600 border-amber-200",
      dot: "bg-amber-400",
      label: t("pending"),
    },
    UPCOMING: {
      class: "bg-orange-50 text-orange-500 border-orange-200",
      dot: "bg-orange-400",
      label: t("upcoming"),
    },
    OVERDUE: {
      class: "bg-red-50 text-red-500 border-red-200",
      dot: "bg-red-500",
      label: t("overdue"),
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

  const PAYMENT_METHOD_LABELS: Record<
    string,
    { label: string; icon: React.ReactNode }
  > = {
    BANK_TRANSFER: {
      label: t("bankTransfer"),
      icon: <Landmark size={13} className="text-blue-400" />,
    },
    CASH: {
      label: t("cash"),
      icon: <DollarSign size={13} className="text-green-400" />,
    },
    CHEQUE: {
      label: t("cheque"),
      icon: <FileText size={13} className="text-amber-400" />,
    },
    ONLINE: {
      label: t("online"),
      icon: <CreditCard size={13} className="text-purple-400" />,
    },
  };

  const getMethodInfo = (m: string) =>
    PAYMENT_METHOD_LABELS[m] ?? {
      label: m,
      icon: <Banknote size={13} className="text-gray-400" />,
    };

  const {
    data: payment,
    isLoading,
    isError,
  } = useQuery<PaymentDetail>({
    queryKey: ["payment-details", paymentId],
    queryFn: () => fetchPaymentDetails(paymentId!),
    enabled: !!paymentId,
  });

  const handleApproveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["payment-details", paymentId] });
  };

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

  if (isError || !payment) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text={t("paymentDetails")} />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={36} className="text-red-300" />
          <p className="text-sm text-red-400">
            {t("failedToLoadPaymentDetails")}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-500 hover:underline"
          >
            {t("goBack")}
          </button>
        </div>
      </div>
    );
  }

  const paymentStatusCfg = getPaymentStatusCfg(payment?.status);
  const installmentStatusCfg = getInstallmentStatusCfg(
    payment?.installment?.status,
  );
  const methodInfo = getMethodInfo(payment.paymentMethod);
  const isPendingPayment = payment.status === "PENDING_REVIEW";

  const installmentPaidPct =
    payment?.installment?.installmentAmount > 0
      ? Math.round(
          (payment.installment.paidAmount /
            payment?.installment?.installmentAmount) *
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
                  {t("receiptImage")}
                </p>
                <button
                  onClick={() => setImgModalOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <XCircle size={15} className="text-gray-400" />
                </button>
              </div>
              <img
                src={`${import.meta.env.VITE_BASE_URL}${payment?.receiptFile}`}
                alt="Receipt"
                className="w-full object-contain max-h-[70vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-5 pb-8">
        <DashboardPageTitle text={t("paymentDetails")} />

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
            {t("dashboard")}
          </Link>
          <ChevronRight size={14} />
          <Link
            to="/dashboard/contract-payments"
            className="hover:text-gray-600 transition-colors"
          >
            {t("payments")}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">{t("paymentDetails")}</span>
        </motion.nav>

        <Link
          to={`/dashboard/contract-payments/${paymentId}/cancel`}
          className="flex ms-auto text-white bg-red-500 px-6 py-1.5 rounded-xl font-bold"
        >
          {t("cancelOrReverse")}
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
              <p className="text-xs text-gray-400">{t("paymentId")}</p>
              <p className="text-sm font-bold text-gray-800">#{payment?.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center sm:text-right">
              <p className="text-xs text-gray-400">{t("amount")}</p>
              <p className="text-lg font-bold text-gray-900">
                {egp(payment.amount)}
              </p>
            </div>
            <div className="h-8 w-px bg-gray-100 hidden sm:block" />
            <StatusBadge cfg={paymentStatusCfg} />
            {payment.isReversal && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-purple-50 text-purple-600 border-purple-200">
                <RefreshCw size={11} /> {t("reversal")}
              </span>
            )}
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-4">
            {/* Installment info */}
            <SectionCard
              icon={<Hash size={15} />}
              title={t("installment")}
              badge={<StatusBadge cfg={installmentStatusCfg} />}
              delay={0.06}
            >
              <div className="flex flex-col">
                <DetailRow
                  label={t("installmentNoDot")}
                  value={ordinal(payment?.installment?.installmentNo)}
                />
                <DetailRow
                  label={t("dueDate")}
                  value={fmtDate(payment?.installment?.dueDate)}
                />
                <DetailRow
                  label={t("totalAmount")}
                  value={egp(payment?.installment?.installmentAmount)}
                />
                <DetailRow
                  label={t("paidAmount")}
                  value={egp(payment?.installment?.paidAmount)}
                  highlight="green"
                />
                <DetailRow
                  label={t("remaining")}
                  value={egp(payment?.installment?.remainingAmount)}
                  highlight={
                    payment?.installment?.remainingAmount > 0
                      ? "red"
                      : undefined
                  }
                />
                <div className="flex flex-col gap-1.5 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{t("paidProgress")}</p>
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
              title={t("contract")}
              delay={0.1}
            >
              <div className="flex flex-col">
                <DetailRow label={t("contractId")} value={payment.contractId} />
                <DetailRow
                  label={t("contractNo")}
                  value={payment.contractNo ?? "—"}
                />
                <DetailRow
                  label={t("instituteId")}
                  value={payment.instituteId}
                />
              </div>
            </SectionCard>

            {/* Audit */}
            <SectionCard
              icon={<Clock size={15} />}
              title={t("auditTrail")}
              delay={0.14}
            >
              <div className="flex flex-col">
                <DetailRow
                  label={t("createdBy")}
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
                  label={t("createdAt")}
                  value={fmtDateTime(payment.createdAt)}
                />
                <DetailRow
                  label={t("updatedAt")}
                  value={fmtDateTime(payment.updatedAt)}
                />
                {payment.cancelledBy && (
                  <DetailRow
                    label={t("cancelledBy")}
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
                    label={t("cancelledAt")}
                    value={fmtDateTime(payment.cancelledAt)}
                  />
                )}
              </div>
            </SectionCard>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Payment details */}
            <SectionCard
              icon={<CreditCard size={15} />}
              title={t("paymentDetails")}
              delay={0.08}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div className="flex flex-col">
                  <DetailRow
                    label={t("paymentId")}
                    value={`#${payment.paymentId}`}
                  />
                  <DetailRow
                    label={t("paymentDate")}
                    value={fmtDate(payment.paymentDate)}
                  />
                  <DetailRow
                    label={t("method")}
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
                    label={t("receiptNoDot")}
                    value={payment.receiptNo ?? "—"}
                    highlight={payment.receiptNo ? "blue" : undefined}
                  />
                </div>
                <div className="flex flex-col">
                  <DetailRow
                    label={t("amount")}
                    value={egp(payment.amount)}
                    highlight="green"
                  />
                  <DetailRow
                    label={t("paidAmount")}
                    value={egp(payment.paidAmount)}
                    highlight="green"
                  />
                  <DetailRow
                    label={t("status")}
                    valueNode={<StatusBadge cfg={paymentStatusCfg} />}
                  />
                  <DetailRow
                    label={t("reversal")}
                    valueNode={
                      payment.isReversal ? (
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          {t("yes")}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">
                          {t("no")}
                        </span>
                      )
                    }
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── Approve Payment — only when PENDING_REVIEW ── */}
            {isPendingPayment && (
              <SectionCard
                icon={<CheckCircle2 size={15} className="text-green-500" />}
                title={t("approvePayment")}
                badge={
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={9} /> {t("awaitingApproval")}
                  </span>
                }
                delay={0.1}
              >
                <ApprovePanel
                  paymentId={paymentId!}
                  onSuccess={handleApproveSuccess}
                />
              </SectionCard>
            )}

            {/* Notes */}
            <SectionCard
              icon={<FileText size={15} />}
              title={t("notes")}
              delay={0.12}
            >
              {payment.notes ? (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {payment.notes}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  {t("noNotesRecordedForPayment")}
                </p>
              )}
            </SectionCard>

            {/* Cancel reason */}
            {payment.cancelReason && (
              <SectionCard
                icon={<XCircle size={15} />}
                title={t("cancellationReason")}
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
              title={t("receiptImage")}
              badge={
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {payment.receiptFile ? t("attached") : t("notAttached")}
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
                    src={`${import.meta.env.VITE_BASE_URL}${payment?.receiptFile}`}
                    alt="Receipt"
                    className="w-full max-h-52 object-contain bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-white bg-black/50 px-3 py-1.5 rounded-full">
                      {t("clickToEnlarge")}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2.5 h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon size={16} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-400">
                    {t("noReceiptImageAttached")}
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
            <ArrowLeft size={15} /> {t("back")}
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default PaymentDetailsPage;
