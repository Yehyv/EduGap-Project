import { useState, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
  DollarSign,
  Hash,
  SplitSquareHorizontal,
  Upload,
  ImageIcon,
  Trash2,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  fetchInstallmentDetails,
  createContractPayment,
} from "@/features/Dashboard/services/dashboardApis";
import { dashboardApi } from "@/shared/services/dashboardApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecordPaymentPayload {
  contractId: number;
  installmentId: number;
  paymentDate: string;
  paidAmount: number;
  paymentMethod: string;
  receiptNo: string;
  notes: string;
}

interface InstallmentDetail {
  id: number;
  installmentId: number;
  contractId: number;
  contractNo: string;
  instituteId: number;
  instituteName: string;
  year: number;
  installmentNo: number;
  dueDate: string;
  installmentPercentage: number;
  installmentAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  notes: string | null;
  paymentsCount: number;
}

type PaymentType = "full" | "partial";

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<
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

const getStatusCfg = (s: string) =>
  statusConfig[s] ?? {
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    label: s,
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number | string) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (iso: string) => iso?.split("T")[0] ?? iso;
const today = () => new Date().toISOString().split("T")[0];

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Payment methods ──────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "ONLINE", label: "Online" },
];

const uploadReceiptImage = async (
  paymentId: number,
  file: File,
): Promise<void> => {
  try {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, JPEG and PDF receipts are allowed");
    }

    const formData = new FormData();
    formData.append("receiptFile", file);

    const res = await dashboardApi.patch(
      `/contract-payments/${paymentId}/receipt`,
      formData,
    );

    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to upload receipt image.";

    throw new Error(message);
  }
};
// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: "green" | "red";
}) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs text-gray-400">{label}</p>
    <p
      className={`text-sm font-semibold ${
        highlight === "green"
          ? "text-green-600"
          : highlight === "red"
            ? "text-red-500"
            : "text-gray-800"
      }`}
    >
      {value}
    </p>
  </div>
);

const FieldLabel = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
    {children}
    {required && <span className="text-red-500">*</span>}
  </label>
);

const inputCls = (err?: boolean) =>
  `w-full h-10 px-3 rounded-lg border text-sm text-gray-700 bg-white
   focus:outline-none focus:ring-2 transition-colors ${
     err
       ? "border-red-300 focus:ring-red-100 focus:border-red-400"
       : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
   }`;

const errMsg = "text-xs text-red-500 flex items-center gap-1 mt-0.5";

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

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Payment Type Toggle ──────────────────────────────────────────────────────

const PaymentTypeToggle = ({
  value,
  onChange,
  remaining,
}: {
  value: PaymentType;
  onChange: (v: PaymentType) => void;
  remaining: number;
}) => (
  <div className="flex flex-col gap-1.5">
    <FieldLabel required>
      <SplitSquareHorizontal size={14} className="text-gray-400" />
      Payment Type
    </FieldLabel>
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange("full")}
        className={`relative flex flex-col items-start gap-1 px-4 py-3 rounded-xl border-2 transition-all text-left ${
          value === "full"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span
            className={`text-sm font-semibold ${value === "full" ? "text-blue-700" : "text-gray-700"}`}
          >
            Full Payment
          </span>
          <span
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              value === "full"
                ? "border-blue-500 bg-blue-500"
                : "border-gray-300"
            }`}
          >
            {value === "full" && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </span>
        </div>
        <span
          className={`text-xs font-medium ${value === "full" ? "text-blue-600" : "text-gray-400"}`}
        >
          {egp(remaining)}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange("partial")}
        className={`relative flex flex-col items-start gap-1 px-4 py-3 rounded-xl border-2 transition-all text-left ${
          value === "partial"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span
            className={`text-sm font-semibold ${value === "partial" ? "text-blue-700" : "text-gray-700"}`}
          >
            Partial Payment
          </span>
          <span
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              value === "partial"
                ? "border-blue-500 bg-blue-500"
                : "border-gray-300"
            }`}
          >
            {value === "partial" && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </span>
        </div>
        <span
          className={`text-xs ${value === "partial" ? "text-blue-500" : "text-gray-400"}`}
        >
          Custom amount
        </span>
      </button>
    </div>
  </div>
);

// ─── Receipt Image Upload ─────────────────────────────────────────────────────

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE_MB = 5;

const ReceiptImageUpload = ({
  file,
  preview,
  onChange,
  onRemove,
  isUploading,
}: {
  file: File | null;
  preview: string | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  isUploading?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (f: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type))
      return "Only JPG, PNG, or WebP images are accepted.";
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
      return `Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`;
    return null;
  };

  const handleFile = useCallback(
    (f: File) => {
      const err = validate(f);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onChange(f);
    },
    [onChange],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // Reset so same file can be re-selected after removal
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>
        <ImageIcon size={14} className="text-gray-400" />
        Receipt Image
        <span className="ml-1 text-[10px] font-normal text-gray-400">
          (optional · JPG, PNG, WebP · max {MAX_FILE_SIZE_MB}MB)
        </span>
      </FieldLabel>

      <AnimatePresence mode="wait">
        {preview ? (
          /* ── Preview state ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50"
          >
            {/* Image */}
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full max-h-56 object-contain py-3"
            />

            {/* Overlay bar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon size={13} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-600 truncate font-medium">
                  {file?.name}
                </p>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {file ? `${(file.size / 1024).toFixed(0)} KB` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Change button */}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
                  className="h-7 px-2.5 rounded-md border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload size={11} />
                  Change
                </button>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={isUploading}
                  className="h-7 w-7 rounded-md border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Uploading overlay */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2"
                >
                  <Loader2 size={20} className="animate-spin text-blue-500" />
                  <p className="text-xs font-medium text-blue-600">
                    Uploading receipt…
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ── Drop zone ── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2.5 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none ${
              dragOver
                ? "border-blue-400 bg-blue-50/60"
                : "border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                dragOver ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <Upload
                size={16}
                className={dragOver ? "text-blue-500" : "text-gray-400"}
              />
            </div>
            <div className="text-center">
              <p
                className={`text-xs font-medium ${dragOver ? "text-blue-600" : "text-gray-500"}`}
              >
                {dragOver
                  ? "Drop image here"
                  : "Click to upload or drag & drop"}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                JPG, PNG, WebP up to {MAX_FILE_SIZE_MB}MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={errMsg}
          >
            <AlertCircle size={11} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const RecordPaymentPage = () => {
  const { installmentId } = useParams<{ installmentId: string }>();
  const navigate = useNavigate();
  const lastSubmittedValues = useRef<typeof initialValues | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>("full");

  // Receipt image state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Handle receipt file selection
  const handleReceiptChange = (file: File) => {
    setReceiptFile(file);
    const url = URL.createObjectURL(file);
    setReceiptPreview(url);
  };

  const handleReceiptRemove = () => {
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const {
    data: installment,
    isLoading,
    isError,
  } = useQuery<InstallmentDetail>({
    queryKey: ["installment-details", installmentId],
    queryFn: async () => {
      const res = await fetchInstallmentDetails(installmentId!);
      return (res?.data ?? res) as InstallmentDetail;
    },
    enabled: !!installmentId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: RecordPaymentPayload) =>
      createContractPayment(payload),
    onSuccess: async (response) => {
      const paymentId =
        (response as { data?: { id?: number }; id?: number })?.data?.id ??
        (response as { id?: number })?.id;

      const v = lastSubmittedValues.current;

      if (receiptFile && paymentId) {
        setIsUploadingReceipt(true);
        try {
          await uploadReceiptImage(paymentId, receiptFile);
        } catch (uploadErr: unknown) {
          const msg =
            (uploadErr as Error)?.message ??
            "Payment saved, but receipt upload failed.";
          showToast("error", msg);
          setIsUploadingReceipt(false);
          setTimeout(
            () =>
              navigate(
                `/dashboard/installments/${installmentId}/create-payment/success`,
                {
                  state: {
                    paymentId: paymentId,
                    paidAmount: v?.paidAmount ?? 0,
                    installmentNo: installment.installmentNo,
                    paymentDate: v?.paymentDate ?? "",
                    paymentMethod: v?.paymentMethod ?? "",
                    receiptNo: v?.receiptNo ?? "",
                    contractId: installment.contractId,
                    installmentId,
                  },
                },
              ),
            2000,
          );
          return;
        }
        setIsUploadingReceipt(false);
      }

      navigate(
        `/dashboard/installments/${installmentId}/create-payment/success`,
        {
          state: {
            paymentId: paymentId,
            paidAmount: v?.paidAmount ?? 0,
            installmentNo: installment.installmentNo,
            paymentDate: v?.paymentDate ?? "",
            paymentMethod: v?.paymentMethod ?? "",
            receiptNo: v?.receiptNo ?? "",
            contractId: installment.contractId,
            installmentId,
          },
        },
      );
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to record payment. Please try again.";
      showToast("error", msg);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-80" />
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !installment) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text="Record Payment" />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={36} className="text-red-300" />
          <p className="text-sm text-red-400">
            Failed to load installment data.
          </p>
          <Link
            to="/dashboard/institutions-contracts"
            className="text-sm text-blue-500 hover:underline"
          >
            Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = getStatusCfg(installment.status);
  const paidPct =
    installment.installmentAmount > 0
      ? Math.round(
          (installment.paidAmount / installment.installmentAmount) * 100,
        )
      : 0;

  const installmentLabel = `${ordinal(installment.installmentNo)} Installment — Due: ${fmtDate(installment.dueDate)} — Remaining: ${egp(installment.remainingAmount)}`;

  const buildValidation = (type: PaymentType, remaining: number) =>
    Yup.object({
      paymentDate: Yup.string().required("Payment date is required"),
      paymentMethod: Yup.string().required("Payment method is required"),
      paidAmount:
        type === "partial"
          ? Yup.number()
              .typeError("Enter a valid amount")
              .min(0.01, "Amount must be greater than 0")
              .max(
                remaining,
                `Cannot exceed remaining balance of ${egp(remaining)}`,
              )
              .required("Amount is required")
          : Yup.number().required(),
      receiptNo: Yup.string(),
      notes: Yup.string(),
    });

  const initialValues = {
    paymentDate: today(),
    paymentMethod: "BANK_TRANSFER",
    paidAmount:
      paymentType === "full"
        ? installment.remainingAmount
        : ("" as unknown as number),
    receiptNo: "",
    notes: "",
  };

  const isSaving = isPending || isUploadingReceipt;

  const submitLabel = () => {
    if (isPending)
      return (
        <>
          <Loader2 size={15} className="animate-spin" /> Saving…
        </>
      );
    if (isUploadingReceipt)
      return (
        <>
          <Loader2 size={15} className="animate-spin" /> Uploading receipt…
        </>
      );
    return (
      <>
        <CreditCard size={15} /> Save Payment
      </>
    );
  };

  return (
    <>
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
        <DashboardPageTitle text="Record Payment" />

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
          <Link
            to={`/dashboard/installments/${installmentId}`}
            className="hover:text-gray-600 transition-colors"
          >
            Installment Details
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">Record Payment</span>
        </motion.nav>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={buildValidation(
            paymentType,
            installment.remainingAmount,
          )}
          onSubmit={(values) => {
            lastSubmittedValues.current = values;
            mutate({
              contractId: installment.contractId,
              installmentId: installment.installmentId,
              paymentDate: values.paymentDate,
              paidAmount: Number(values.paidAmount),
              paymentMethod: values.paymentMethod,
              receiptNo: values.receiptNo,
              notes: values.notes,
            });
          }}
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                {/* ── Left sidebar ─────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                    <Building2 size={15} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Payment Information
                    </h3>
                  </div>

                  <div className="px-5 py-5 flex flex-col gap-3.5">
                    <InfoRow
                      label="Contract No."
                      value={installment.contractNo}
                    />
                    <div className="border-t border-gray-50" />
                    <InfoRow
                      label="Institute"
                      value={installment.instituteName}
                    />
                    <div className="border-t border-gray-50" />
                    <InfoRow label="Year" value={installment.year} />
                    <div className="border-t border-gray-50" />

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-gray-400">Installment</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {ordinal(installment.installmentNo)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.class}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                        />
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="border-t border-gray-50" />
                    <InfoRow
                      label="Due Date"
                      value={fmtDate(installment.dueDate)}
                    />
                    <div className="border-t border-gray-50" />
                    <InfoRow
                      label="Installment Amount"
                      value={egp(installment.installmentAmount)}
                    />
                    <div className="border-t border-gray-50" />
                    <InfoRow
                      label="Percentage"
                      value={`${installment.installmentPercentage}%`}
                    />
                    <div className="border-t border-gray-50" />
                    <InfoRow
                      label="Paid Amount"
                      value={egp(installment.paidAmount)}
                      highlight="green"
                    />
                    <div className="border-t border-gray-50" />
                    <InfoRow
                      label="Remaining Amount"
                      value={egp(installment.remainingAmount)}
                      highlight={
                        installment.remainingAmount > 0 ? "red" : undefined
                      }
                    />

                    {/* Progress bar */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">Paid Progress</p>
                        <p className="text-xs font-semibold text-gray-600">
                          {paidPct}%
                        </p>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(paidPct, 100)}%` }}
                          transition={{
                            delay: 0.4,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                          className="h-full bg-green-500 rounded-full"
                        />
                      </div>
                    </div>

                    {installment.paymentsCount > 0 && (
                      <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle
                          size={12}
                          className="text-amber-500 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-amber-700">
                          This installment already has{" "}
                          {installment.paymentsCount} recorded payment
                          {installment.paymentsCount > 1 ? "s" : ""}.
                        </p>
                      </div>
                    )}

                    {installment.remainingAmount === 0 && (
                      <div className="flex items-start gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2
                          size={12}
                          className="text-green-500 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-green-700">
                          This installment is fully paid.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* ── Right — form ─────────────────────────────────────── */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                      <CreditCard size={15} className="text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Record Payment
                      </h3>
                    </div>

                    <div className="px-5 py-5 flex flex-col gap-5">
                      {/* Installment — read-only */}
                      <div className="flex flex-col gap-1.5">
                        <FieldLabel>
                          <Hash size={14} className="text-gray-400" />
                          Installment
                        </FieldLabel>
                        <div className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 flex items-center cursor-not-allowed select-none truncate">
                          {installmentLabel}
                        </div>
                      </div>

                      {/* Payment Type Toggle */}
                      <PaymentTypeToggle
                        value={paymentType}
                        remaining={installment.remainingAmount}
                        onChange={(type) => {
                          setPaymentType(type);
                          setFieldValue(
                            "paidAmount",
                            type === "full" ? installment.remainingAmount : "",
                          );
                        }}
                      />

                      {/* Payment Date + Method */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <FieldLabel required>
                            <CalendarDays size={14} className="text-gray-400" />
                            Payment Date
                          </FieldLabel>
                          <Field
                            type="date"
                            name="paymentDate"
                            className={inputCls(
                              !!(errors.paymentDate && touched.paymentDate),
                            )}
                          />
                          <ErrorMessage name="paymentDate">
                            {(msg) => (
                              <p className={errMsg}>
                                <AlertCircle size={11} />
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <FieldLabel required>
                            <Banknote size={14} className="text-gray-400" />
                            Payment Method
                          </FieldLabel>
                          <Field
                            as="select"
                            name="paymentMethod"
                            className={`${inputCls(!!(errors.paymentMethod && touched.paymentMethod))} appearance-none`}
                          >
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="paymentMethod">
                            {(msg) => (
                              <p className={errMsg}>
                                <AlertCircle size={11} />
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>
                      </div>

                      {/* Amount + Receipt No */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <FieldLabel required>
                            <DollarSign size={14} className="text-gray-400" />
                            Amount (EGP)
                          </FieldLabel>

                          <AnimatePresence mode="wait">
                            {paymentType === "full" ? (
                              <motion.div
                                key="full-amount"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="w-full h-10 px-3 rounded-lg border border-green-200 bg-green-50 text-sm font-semibold text-green-700 flex items-center justify-between cursor-not-allowed select-none"
                              >
                                <span>{egp(installment.remainingAmount)}</span>
                                <span className="text-[10px] font-medium text-green-500 bg-green-100 px-1.5 py-0.5 rounded">
                                  Full
                                </span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="partial-amount"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="flex flex-col gap-1"
                              >
                                <Field
                                  type="number"
                                  name="paidAmount"
                                  placeholder={`Max ${egp(installment.remainingAmount)}`}
                                  min={0.01}
                                  max={installment.remainingAmount}
                                  step={0.01}
                                  className={inputCls(
                                    !!(errors.paidAmount && touched.paidAmount),
                                  )}
                                />
                                {!errors.paidAmount && (
                                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                    Max:{" "}
                                    <span className="font-medium text-gray-500">
                                      {egp(installment.remainingAmount)}
                                    </span>
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <ErrorMessage name="paidAmount">
                            {(msg) => (
                              <p className={errMsg}>
                                <AlertCircle size={11} />
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <FieldLabel>
                            <Receipt size={14} className="text-gray-400" />
                            Receipt No.
                          </FieldLabel>
                          <Field
                            type="text"
                            name="receiptNo"
                            placeholder="e.g. RCP-2025-016"
                            className={inputCls(
                              !!(errors.receiptNo && touched.receiptNo),
                            )}
                          />
                        </div>
                      </div>

                      {/* ── Receipt Image Upload ── */}
                      <ReceiptImageUpload
                        file={receiptFile}
                        preview={receiptPreview}
                        onChange={handleReceiptChange}
                        onRemove={handleReceiptRemove}
                        isUploading={isUploadingReceipt}
                      />

                      {/* Notes */}
                      <div className="flex flex-col gap-1.5">
                        <FieldLabel>
                          <FileText size={14} className="text-gray-400" />
                          Notes
                        </FieldLabel>
                        <Field
                          as="textarea"
                          name="notes"
                          rows={3}
                          placeholder="e.g. Full payment for 2nd installment"
                          className={`${inputCls()} h-auto py-2.5 resize-none`}
                        />
                      </div>

                      {/* Partial payment live summary */}
                      <AnimatePresence>
                        {paymentType === "partial" &&
                          Number(values.paidAmount) > 0 &&
                          Number(values.paidAmount) <=
                            installment.remainingAmount && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="rounded-xl border border-blue-100 bg-blue-50 overflow-hidden"
                            >
                              <p className="px-4 py-2.5 text-xs font-semibold text-blue-700 border-b border-blue-100">
                                Payment Summary
                              </p>
                              <div className="px-4 py-3 grid grid-cols-3 gap-3">
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">
                                    Paying now
                                  </p>
                                  <p className="text-xs font-semibold text-blue-700">
                                    {egp(Number(values.paidAmount))}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">
                                    Still remaining
                                  </p>
                                  <p className="text-xs font-semibold text-red-500">
                                    {egp(
                                      installment.remainingAmount -
                                        Number(values.paidAmount),
                                    )}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">
                                    Coverage
                                  </p>
                                  <p className="text-xs font-semibold text-gray-700">
                                    {Math.round(
                                      (Number(values.paidAmount) /
                                        installment.remainingAmount) *
                                        100,
                                    )}
                                    %
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                      </AnimatePresence>

                      {/* Fully paid notice */}
                      <AnimatePresence>
                        {installment.remainingAmount === 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="flex items-start gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <CheckCircle2
                              size={13}
                              className="text-green-500 flex-shrink-0 mt-0.5"
                            />
                            <p className="text-xs text-green-700">
                              This installment is fully paid. Any new payment
                              will be recorded as additional.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      to={`/dashboard/institutions-contracts/${installment.contractId}/installments`}
                      className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <X size={15} />
                      Cancel
                    </Link>
                    <motion.button
                      type="submit"
                      disabled={isSaving}
                      whileTap={{ scale: isSaving ? 1 : 0.97 }}
                      className="h-10 px-6 rounded-lg bg-secondary hover:bg-secondary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      {submitLabel()}
                    </motion.button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default RecordPaymentPage;
