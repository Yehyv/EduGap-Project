import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  Printer,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailCell = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs text-gray-400 font-medium">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const PaymentSuccessPage = ({
  // Provide defaults so the component is self-contained for preview
  paymentId = "PAY-2025-0255",
  paidAmount = 75765,
  installmentNo = 2,
  paymentDate = "2025-04-20",
  paymentMethod = "Bank Transfer",
  receiptNo = "RCP1-2025-0156",
  contractId,
  installmentId,
}) => {
  // Support receiving data via router state (real usage)
  const location = useLocation?.() ?? {};
  const state = location?.state ?? {};

  const data = {
    paymentId: state.paymentId ?? paymentId,
    paidAmount: state.paidAmount ?? paidAmount,
    installmentNo: state.installmentNo ?? installmentNo,
    paymentDate: state.paymentDate ?? paymentDate,
    paymentMethod: state.paymentMethod ?? paymentMethod,
    receiptNo: state.receiptNo ?? receiptNo,
    contractId: state.contractId ?? contractId,
    installmentId: state.installmentId ?? installmentId,
  };

  const methodLabel =
    {
      BANK_TRANSFER: "Bank Transfer",
      CASH: "Cash",
      CHEQUE: "Cheque",
      ONLINE: "Online",
    }[data.paymentMethod] ?? data.paymentMethod;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Breadcrumb ── */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-1.5 text-sm text-gray-400 px-6 py-4"
      >
        <Link
          to="/dashboard/home"
          className="hover:text-gray-600 transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight size={13} />
        <Link
          to="/dashboard/installments"
          className="hover:text-gray-600 transition-colors"
        >
          Installments
        </Link>
        <ChevronRight size={13} />
        <Link
          to={`/dashboard/installments/${data.installmentId}`}
          className="hover:text-gray-600 transition-colors"
        >
          Installment Details
        </Link>
        <ChevronRight size={13} />
        <span className="text-gray-600 font-medium">Payment Confirmation</span>
      </motion.nav>

      {/* ── Card ── */}
      <div className="flex flex-1 items-start justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* ── Success header ── */}
          <div className="flex flex-col items-center pt-10 pb-7 px-8">
            {/* Animated check circle */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.45,
                type: "spring",
                stiffness: 200,
              }}
              className="relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-green-400 mb-5"
            >
              {/* Subtle ring pulse */}
              <motion.span
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-green-300"
              />
              <CheckCircle2
                size={32}
                className="text-green-500"
                strokeWidth={1.8}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.35 }}
              className="text-lg font-bold text-gray-800 tracking-tight"
            >
              Payment Recorded Successfully!
            </motion.h1>
          </div>

          {/* ── Details grid ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.35 }}
            className="mx-6 mb-6 rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
              <div className="p-4">
                <DetailCell label="Payment ID" value={data.paymentId} />
              </div>
              <div className="p-4">
                <DetailCell label="Amount Paid" value={egp(data.paidAmount)} />
              </div>
              <div className="p-4">
                <DetailCell
                  label="Installment"
                  value={`${ordinal(data.installmentNo)} Installment`}
                />
              </div>
              <div className="p-4">
                <DetailCell label="Payment Date" value={data.paymentDate} />
              </div>
              <div className="p-4">
                <DetailCell label="Payment Method" value={methodLabel} />
              </div>
              <div className="p-4">
                <DetailCell label="Receipt No." value={data.receiptNo || "—"} />
              </div>
            </div>
          </motion.div>

          {/* ── Notice ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-xs text-gray-400 text-center px-8 pb-7 leading-relaxed"
          >
            The payment has been recorded and will reflect in the installment
            summary.
          </motion.p>

          {/* ── Divider ── */}
          <div className="border-t border-gray-100" />

          {/* ── Actions ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="flex items-center justify-between gap-3 px-6 py-5"
          >
            {/* View Payment Details */}
            <Link
              to={`/dashboard/contract-payments/${data.paymentId}`}
              className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={14} />
              View Payment Details
            </Link>

            {/* Print Receipt */}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={14} />
              Print Receipt
            </button>

            {/* Back to Installments */}
            <Link
              to={
                data.installmentId
                  ? `/dashboard/installments/${data.installmentId}`
                  : "/dashboard/installments"
              }
              className="flex-1 h-10 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              Back to Installments
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
