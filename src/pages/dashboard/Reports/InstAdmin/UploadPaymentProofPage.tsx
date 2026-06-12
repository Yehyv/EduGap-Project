import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  CloudUpload,
  X,
  FileImage,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

async function fetchNextInstallment(academicYear: number) {
  const res = await dashboardApi.get(
    "/annual-settlements/institute/next-installment",
    { params: { academicYear } },
  );
  return res.data.data;
}

async function uploadPaymentProof(body: FormData) {
  const res = await dashboardApi.post(
    "/contract-payments/institute/upload-proof",
    body,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Installment {
  installmentId: number;
  installmentNo: number;
  label: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  daysLeft: number;
  status: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmtEGP = (n: number) =>
  `EGP ${n.toLocaleString("en-EG", { minimumFractionDigits: 0 })}`;

const fmtDate = (iso: string) => new Date(iso).toISOString().slice(0, 10);

const PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "ONLINE", label: "Online Payment" },
];

const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
const MAX_MB = 5;

function fileIcon(type: string) {
  if (type === "application/pdf")
    return <FileText size={20} className="text-red-500" />;
  return <FileImage size={20} className="text-blue-500" />;
}

// ─── ANIMATION ───────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.07, ease: "easeOut" },
  }),
};

// ─── INFO ROW ─────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-base font-bold ${highlight ? "text-blue-600" : "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const YEAR_OPTIONS = Array.from(
  { length: 6 },
  (_, i) => new Date().getFullYear() - 2 + i,
);

export default function UploadPaymentProofPage() {
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  // form state
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [receiptNo, setReceiptNo] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // fetch installment
  const { data, isLoading } = useQuery({
    queryKey: ["next-installment", academicYear],
    queryFn: () => fetchNextInstallment(academicYear),
    retry: false,
  });

  const installment: Installment | null = data?.nextInstallment ?? null;

  // upload mutation
  const mutation = useMutation({
    mutationFn: uploadPaymentProof,
    onSuccess: () => {
      showToast("success", "Payment proof uploaded successfully.");
      setFile(null);
      setReceiptNo("");
      setAmount("");
      setNotes("");
    },
    onError: (e) => {
      showToast(
        "error",
        e?.response?.data?.message?.[0] || "Upload failed. Please try again.",
      );
    },
  });

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // file handling
  const validateAndSet = useCallback((f: File) => {
    setFileError("");
    if (!ACCEPTED.includes(f.type)) {
      setFileError("Only JPG, PNG, GIF and PDF files are accepted.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setFileError(`File size must not exceed ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) validateAndSet(f);
    },
    [validateAndSet],
  );

  const handleSubmit = () => {
    if (!installment) return;
    const fd = new FormData();
    fd.append("installmentId", String(installment.installmentId));
    fd.append("amount", amount || String(installment.amount));
    fd.append("paymentMethod", paymentMethod);
    fd.append("receiptNo", receiptNo);
    fd.append("notes", notes);
    if (file) fd.append("receiptFile", file);
    mutation.mutate(fd);
  };

  const handleCancel = () => {
    setFile(null);
    setReceiptNo("");
    setAmount("");
    setNotes("");
    setPaymentMethod("BANK_TRANSFER");
    setFileError("");
  };

  return (
    <>
      <DashboardPageTitle text="Upload Payment Proof" />
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto space-y-5">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-sm text-slate-400"
          >
            {["Billing", "Payments"].map((c) => (
              <span key={c} className="flex items-center gap-1.5">
                <span className="hover:text-slate-600 cursor-pointer transition-colors">
                  {c}
                </span>
                <ChevronRight size={13} className="text-slate-300" />
              </span>
            ))}
            <span className="text-slate-700 font-semibold">Upload Proof</span>
          </motion.nav>

          {/* Year selector */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3 flex items-center gap-3"
          >
            <span className="text-sm font-semibold text-slate-500 shrink-0">
              Academic Year
            </span>
            <div className="relative">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-slate-300" />
            </div>
          )}

          {/* No installment / API error — friendly prompt to try another year */}
          {!isLoading && !installment && (
            <motion.div
              key={academicYear}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex flex-col items-center gap-3 py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <AlertCircle size={28} className="text-slate-300" />
              </div>
              <p className="text-base font-semibold text-slate-600">
                No installment found for {academicYear}
              </p>
              <p className="text-sm text-slate-400">
                Try selecting a different year from the dropdown above.
              </p>
            </motion.div>
          )}

          {!isLoading && installment && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
                {/* ── Left Panel — Installment Info ── */}
                <div className="border-b md:border-b-0 md:border-r border-slate-100 p-6 flex flex-col gap-5 bg-slate-50/60">
                  <InfoRow label="Installment" value={installment.label} />
                  <InfoRow
                    label="Due Date"
                    value={fmtDate(installment.dueDate)}
                  />
                  <InfoRow
                    label="Amount"
                    value={fmtEGP(installment.amount)}
                    highlight
                  />
                  <InfoRow
                    label="Remaining Amount"
                    value={fmtEGP(installment.remainingAmount)}
                  />

                  {/* Days left badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-xs font-semibold ${
                      installment.daysLeft <= 5
                        ? "bg-red-100 text-red-600"
                        : installment.daysLeft <= 14
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        installment.daysLeft <= 5
                          ? "bg-red-500"
                          : installment.daysLeft <= 14
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                    />
                    {installment.daysLeft} days left
                  </div>
                </div>

                {/* ── Right Panel — Upload Form ── */}
                <div className="p-6 space-y-5">
                  <h2 className="text-lg font-bold text-slate-800 text-center">
                    Upload Payment Proof
                  </h2>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
                    ${file ? "border-blue-300 bg-blue-50/40 cursor-default" : "hover:border-blue-400 hover:bg-blue-50/30"}
                    ${dragOver ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-slate-200 bg-slate-50/50"}
                  `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED.join(",")}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) validateAndSet(f);
                      }}
                    />

                    <AnimatePresence mode="wait">
                      {!file ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center gap-2 py-8 px-4"
                        >
                          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                            <CloudUpload size={26} className="text-blue-500" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700">
                            Drag & drop your file here
                          </p>
                          <p className="text-xs text-slate-400">or</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Choose File
                          </button>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Accepted formats: JPG, PNG, GIF, PDF (Max {MAX_MB}
                            MB)
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="file"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3 px-4 py-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                            {fileIcon(file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setFileError("");
                            }}
                            className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors group"
                          >
                            <X
                              size={14}
                              className="text-slate-400 group-hover:text-red-500"
                            />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {fileError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 font-medium flex items-center gap-1.5 -mt-2"
                    >
                      <AlertCircle size={12} /> {fileError}
                    </motion.p>
                  )}

                  {/* Payment Method + Receipt No */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Payment Method
                      </label>
                      <div className="relative">
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                        >
                          {PAYMENT_METHODS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="2.5"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Receipt No.
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. REC-20250601"
                        value={receiptNo}
                        onChange={(e) => setReceiptNo(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Amount (EGP)
                    </label>
                    <input
                      type="number"
                      placeholder={String(installment.amount)}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                    <p className="text-[11px] text-slate-400">
                      Leave empty to use the installment amount:{" "}
                      {fmtEGP(installment.amount)}
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add any notes about this payment…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 bg-slate-50/60">
                <button
                  onClick={handleCancel}
                  className="h-10 px-6 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={mutation.isPending || !file}
                  className="h-10 px-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {mutation.isPending ? "Uploading…" : "Upload"}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className={`fixed top-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold z-50 ${
                toast.type === "success"
                  ? "bg-white border-emerald-200 text-emerald-700"
                  : "bg-white border-red-200 text-red-600"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <AlertCircle size={16} className="text-red-500" />
              )}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
