import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  CreditCard,
  CalendarDays,
  Banknote,
  Receipt,
  FileText,
  Building2,
  Hash,
  BadgeCheck,
  XCircle,
  Clock,
  RefreshCw,
  Landmark,
  DollarSign,
  ChevronDown,
  TriangleAlert,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { fetchPaymentDetails } from "@/features/Dashboard/services/dashboardApis";
import { dashboardApi } from "@/shared/services/dashboardApi";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentDetail {
  id: number;
  paymentId: number;
  contractId: number;
  contractNo: string | null;
  installment: {
    id: number;
    installmentNo: number;
    dueDate: string;
  };
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  receiptNo: string | null;
  status: string;
  notes: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number | string) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (iso: string) => iso?.split("T")[0] ?? iso;

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

const InfoRow = ({
  icon,
  label,
  value,
  valueNode,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | number;
  valueNode?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs text-gray-400 flex items-center gap-1">
      {icon && <span className="text-gray-300">{icon}</span>}
      {label}
    </p>

    {valueNode ?? (
      <p className="text-sm font-semibold text-gray-800">{value ?? "—"}</p>
    )}
  </div>
);

const Toast = ({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -12, scale: 0.96 }}
    className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3
      rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
        type === "success"
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
  >
    {type === "success" ? (
      <CheckCircle2 size={17} className="text-green-500 flex-shrink-0" />
    ) : (
      <AlertCircle size={17} className="text-red-500 flex-shrink-0" />
    )}

    <span className="flex-1">{message}</span>

    <button onClick={onClose}>
      <X size={14} />
    </button>
  </motion.div>
);

// ─── Cancel API ───────────────────────────────────────────────────────────────

const cancelPayment = async (
  paymentId: string,
  cancelReason: string,
): Promise<void> => {
  try {
    const res = await dashboardApi.patch(
      `/contract-payments/${paymentId}/cancel`,
      { cancelReason },
    );

    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to cancel payment.";

    throw new Error(message);
  }
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CancelPaymentPage = () => {
  const { t } = useLanguage();

  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const [selectedReason, setSelectedReason] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [reasonError, setReasonError] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ─── Cancel reasons ────────────────────────────────────────────────────────

  const CANCEL_REASONS = [
    {
      value: "Incorrect Amount",
      label: t("incorrectAmount"),
    },
    {
      value: "Duplicate Payment",
      label: t("duplicatePayment"),
    },
    {
      value: "Payment Made by Mistake",
      label: t("paymentMadeByMistake"),
    },
    {
      value: "Customer Request",
      label: t("customerRequest"),
    },
    {
      value: "Other",
      label: t("other"),
    },
  ];

  // ─── Status config ─────────────────────────────────────────────────────────

  const paymentStatusConfig: Record<
    string,
    {
      class: string;
      dot: string;
      label: string;
      icon: React.ReactNode;
    }
  > = {
    CONFIRMED: {
      class: "bg-green-50 text-green-600 border-green-200",
      dot: "bg-green-500",
      label: t("confirmed"),
      icon: <BadgeCheck size={12} />,
    },

    PENDING: {
      class: "bg-amber-50 text-amber-600 border-amber-200",
      dot: "bg-amber-400",
      label: t("pending"),
      icon: <Clock size={12} />,
    },

    CANCELLED: {
      class: "bg-red-50 text-red-500 border-red-200",
      dot: "bg-red-500",
      label: t("cancelled"),
      icon: <XCircle size={12} />,
    },

    REVERSED: {
      class: "bg-purple-50 text-purple-500 border-purple-200",
      dot: "bg-purple-400",
      label: t("reversed"),
      icon: <RefreshCw size={12} />,
    },
  };

  const getStatusCfg = (s: string) =>
    paymentStatusConfig[s] ?? {
      class: "bg-gray-100 text-gray-500 border-gray-200",
      dot: "bg-gray-400",
      label: s,
      icon: null,
    };

  // ─── Payment method labels ────────────────────────────────────────────────

  const METHOD_LABELS: Record<
    string,
    {
      label: string;
      icon: React.ReactNode;
    }
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
    METHOD_LABELS[m] ?? {
      label: m,
      icon: <Banknote size={13} className="text-gray-400" />,
    };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // ─── Payment query ─────────────────────────────────────────────────────────

  const {
    data: payment,
    isLoading,
    isError,
  } = useQuery<PaymentDetail>({
    queryKey: ["payment-details", paymentId],
    queryFn: () => fetchPaymentDetails(paymentId!),
    enabled: !!paymentId,
  });

  // ─── Mutation ──────────────────────────────────────────────────────────────

  const { mutate, isPending } = useMutation({
    mutationFn: () => cancelPayment(paymentId!, selectedReason),

    onSuccess: () => {
      showToast("success", t("paymentCancelledSuccess"));

      setTimeout(() => {
        navigate(-1);
      }, 1600);
    },

    onError: (err: unknown) => {
      const msg = (err as Error)?.message ?? t("failedCancelPayment");

      showToast("error", msg);
    },
  });

  const handleSubmit = () => {
    if (!selectedReason) {
      setReasonError(true);
      return;
    }

    setReasonError(false);
    mutate();
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────

  if (isError || !payment) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text={t("cancelPayment")} />

        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={36} className="text-red-300" />

          <p className="text-sm text-red-400">{t("failedLoadPayment")}</p>

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

  const statusCfg = getStatusCfg(payment.status);
  const methodInfo = getMethodInfo(payment.paymentMethod);

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-5 pb-8">
        <DashboardPageTitle text={t("cancelPayment")} />

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

          <Link
            to={`/dashboard/payments/${paymentId}`}
            className="hover:text-gray-600 transition-colors"
          >
            {t("paymentDetails")}
          </Link>

          <ChevronRight size={14} />

          <span className="text-gray-600">{t("cancelPayment")}</span>
        </motion.nav>

        {/* Warning banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl"
        >
          <TriangleAlert
            size={16}
            className="text-red-400 flex-shrink-0 mt-0.5"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              {t("cannotUndo")}
            </p>

            <p className="text-xs text-red-500 mt-0.5">
              {t("cancelPaymentWarning")}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* ── Left — Payment Information ─────────────────────────────── */}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <Building2 size={15} className="text-gray-400" />

              <h3 className="text-sm font-semibold text-gray-800">
                {t("paymentInformation")}
              </h3>
            </div>

            <div className="px-5 py-5 flex flex-col gap-4">
              <InfoRow
                icon={<Hash size={11} />}
                label={t("paymentId")}
                value={`PAY-${String(payment.id).padStart(4, "0")}`}
              />

              <div className="border-t border-gray-50" />

              <InfoRow
                icon={<Building2 size={11} />}
                label={t("contractNo")}
                value={
                  payment.contractNo ??
                  `CON-${String(payment.contractId).padStart(3, "0")}`
                }
              />

              <div className="border-t border-gray-50" />

              <InfoRow
                icon={<Hash size={11} />}
                label={t("installment")}
                value={`${ordinal(
                  payment?.installment?.installmentNo,
                )} ${t("installment")}`}
              />

              <div className="border-t border-gray-50" />

              <InfoRow
                icon={<CalendarDays size={11} />}
                label={t("paymentDate")}
                value={fmtDate(payment?.paymentDate)}
              />

              <div className="border-t border-gray-50" />

              <InfoRow
                icon={<DollarSign size={11} />}
                label={t("amountEGP")}
                valueNode={
                  <p className="text-sm font-bold text-gray-900">
                    {egp(payment?.amount)}
                  </p>
                }
              />

              <div className="border-t border-gray-50" />

              <InfoRow
                icon={<Banknote size={11} />}
                label={t("paymentMethod")}
                valueNode={
                  <div className="flex items-center gap-1.5">
                    {methodInfo?.icon}

                    <span className="text-sm font-semibold text-gray-800">
                      {methodInfo?.label}
                    </span>
                  </div>
                }
              />

              <div className="border-t border-gray-50" />

              <InfoRow
                icon={<Receipt size={11} />}
                label={t("receiptNo")}
                value={payment.receiptNo ?? "—"}
              />

              <div className="border-t border-gray-50" />

              <InfoRow
                label={t("status")}
                valueNode={
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.class}`}
                  >
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                }
              />
            </div>
          </motion.div>

          {/* ── Right — Cancel / Reverse Form ──────────────────────────── */}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <XCircle size={15} className="text-gray-400" />

              <h3 className="text-sm font-semibold text-gray-800">
                {t("cancelReversePayment")}
              </h3>
            </div>

            <div className="px-5 py-5 flex flex-col gap-5">
              {/* Reason dropdown */}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  {t("reasonForCancellation")}

                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((p) => !p)}
                    className={`w-full h-10 px-3 rounded-lg border text-sm text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-2 ${
                      reasonError
                        ? "border-red-300 focus:ring-red-100 bg-white text-gray-700"
                        : dropdownOpen
                          ? "border-blue-400 focus:ring-blue-100 bg-white text-gray-700"
                          : "border-gray-200 focus:ring-blue-100 bg-white text-gray-400 hover:border-gray-300"
                    } ${selectedReason ? "text-gray-800" : ""}`}
                  >
                    <span>
                      {CANCEL_REASONS.find(
                        (reason) => reason.value === selectedReason,
                      )?.label || t("selectReason")}
                    </span>

                    <motion.span
                      animate={{
                        rotate: dropdownOpen ? 180 : 0,
                      }}
                      transition={{ duration: 0.18 }}
                    >
                      <ChevronDown size={15} className="text-gray-400" />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -6,
                          scale: 0.98,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -6,
                          scale: 0.98,
                        }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReason("");
                            setDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-sm text-left text-gray-400 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                        >
                          {t("selectReason")}
                        </button>

                        {CANCEL_REASONS.map((reason) => (
                          <button
                            key={reason.value}
                            type="button"
                            onClick={() => {
                              setSelectedReason(reason.value);
                              setDropdownOpen(false);
                              setReasonError(false);
                            }}
                            className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${
                              selectedReason === reason.value
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {reason.label}

                            {selectedReason === reason.value && (
                              <CheckCircle2
                                size={14}
                                className="text-blue-500 flex-shrink-0"
                              />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {reasonError && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -4,
                      }}
                      className="text-xs text-red-500 flex items-center gap-1 mt-0.5"
                    >
                      <AlertCircle size={11} />
                      {t("selectReasonError")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Additional notes */}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <FileText size={14} className="text-gray-400" />

                  {t("additionalNotes")}

                  <span className="text-xs font-normal text-gray-400">
                    ({t("optional")})
                  </span>
                </label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder={t("enterAdditionalNotes")}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors placeholder:text-gray-400"
                />
              </div>

              {/* Confirmation hint */}

              <AnimatePresence>
                {selectedReason && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 4,
                    }}
                    className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <TriangleAlert
                      size={13}
                      className="text-amber-500 flex-shrink-0 mt-0.5"
                    />

                    <p className="text-xs text-amber-700">
                      {t("cancelConfirmation")}{" "}
                      <span className="font-semibold">#{payment.id}</span>{" "}
                      {t("of")}{" "}
                      <span className="font-semibold">
                        {egp(payment.amount)}
                      </span>{" "}
                      {t("withReason")}{" "}
                      <span className="font-semibold">
                        "
                        {
                          CANCEL_REASONS.find(
                            (reason) => reason.value === selectedReason,
                          )?.label
                        }
                        "
                      </span>
                      .
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={isPending}
                  className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <X size={15} />
                  {t("cancel")}
                </button>

                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  whileTap={{
                    scale: isPending ? 1 : 0.97,
                  }}
                  className="h-10 px-6 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />

                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <XCircle size={15} />
                      {t("reversePayment")}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CancelPaymentPage;
