import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  CalendarDays,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Save,
  FileText,
  DollarSign,
  Percent,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editInstallment,
  getInstallmentForUpdate,
} from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditInstallmentPayload {
  dueDate: string;
  installmentAmount: number;
  installmentPercentage: number;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number | string) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Accepts both "2026-01-15T00:00:00Z" and bare "2026-01-15" */
const fmtDate = (iso: string) => iso.split("T")[0];

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoField = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
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
  `w-full h-10 px-3 rounded-lg border text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition-colors ${
    err
      ? "border-red-300 focus:ring-red-100 focus:border-red-400"
      : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
  }`;

const errCls = "text-xs text-red-500 flex items-center gap-1 mt-0.5";

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
    className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
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

// ─── Inner Form ───────────────────────────────────────────────────────────────

interface InnerFormProps {
  installmentId: string;
  data: InstallmentDetail;
  initialValues: EditInstallmentPayload;
  isPending: boolean;
  onSubmit: (payload: EditInstallmentPayload) => void;
}

const InnerForm = ({
  installmentId,
  data,
  initialValues,
  isPending,
  onSubmit,
}: InnerFormProps) => {
  const { t } = useLanguage();
  const originalValues = useMemo(() => ({ ...initialValues }), []);

  const statusConfig: Record<
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
    PENDING: {
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

  const getStatusCfg = (s: string) =>
    statusConfig[s] ?? {
      class: "bg-gray-100 text-gray-500 border-gray-200",
      dot: "bg-gray-400",
      label: s,
    };

  const validationSchema = Yup.object({
    dueDate: Yup.string().required(t("dueDateRequired")),
    installmentAmount: Yup.number()
      .min(1, t("amountGreaterThanZero"))
      .required(t("amountRequired")),
    installmentPercentage: Yup.number()
      .min(0, t("mustBeAtLeastZero"))
      .max(100, t("cannotExceed100"))
      .required(t("percentageRequired")),
    notes: Yup.string(),
  });

  const statusCfg = getStatusCfg(data.status);

  // Derive paid percentage from available fields
  const paidPercentage =
    data.installmentAmount > 0
      ? Math.round((data.paidAmount / data.installmentAmount) * 100)
      : 0;

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit({
          dueDate: values.dueDate,
          installmentAmount: Number(values.installmentAmount),
          installmentPercentage: Number(values.installmentPercentage),
          notes: values.notes,
        });
      }}
    >
      {({ values, errors, touched }) => {
        const hasChanges =
          values.dueDate !== originalValues.dueDate ||
          Number(values.installmentAmount) !==
            Number(originalValues.installmentAmount) ||
          Number(values.installmentPercentage) !==
            Number(originalValues.installmentPercentage) ||
          values.notes !== originalValues.notes;

        return (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              {/* ── Left — Installment + Contract Info ───────────────────── */}
              <div className="flex flex-col gap-4">
                {/* Current installment read-only summary */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                    <CreditCard size={15} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      {t("installment")} #{data.installmentNo}
                    </h3>
                    <span
                      className={`ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.class}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                      />
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="px-5 py-5 flex flex-col gap-3.5">
                    <InfoField
                      label={t("installmentNo")}
                      value={ordinal(data.installmentNo)}
                    />
                    <div className="border-t border-gray-50" />

                    <InfoField
                      label={t("contractNo")}
                      value={data.contractNo}
                    />
                    <div className="border-t border-gray-50" />
                    <InfoField
                      label={t("institute")}
                      value={data.instituteName}
                    />
                    <div className="border-t border-gray-50" />
                    <InfoField label={t("year")} value={data.year} />

                    <div className="border-t border-gray-50" />
                    <InfoField
                      label={t("currentDueDate")}
                      value={fmtDate(data.dueDate)}
                    />
                    <div className="border-t border-gray-50" />
                    <InfoField
                      label={t("installmentAmount")}
                      value={egp(data.installmentAmount)}
                    />
                    <div className="border-t border-gray-50" />
                    <InfoField
                      label={t("percentage")}
                      value={`${data.installmentPercentage}%`}
                    />
                    <div className="border-t border-gray-50" />
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">{t("paidAmount")}</p>
                      <p className="text-sm font-bold text-green-600">
                        {egp(data.paidAmount)}
                      </p>
                    </div>
                    <div className="border-t border-gray-50" />
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">
                        {t("remainingAmount")}
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          data.remainingAmount > 0
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {egp(data.remainingAmount)}
                      </p>
                    </div>

                    {/* Paid progress bar */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {t("paidProgress")}
                        </p>
                        <p className="text-xs font-semibold text-gray-600">
                          {paidPercentage}%
                        </p>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(paidPercentage, 100)}%`,
                          }}
                          transition={{
                            delay: 0.4,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                          className="h-full bg-green-500 rounded-full"
                        />
                      </div>
                    </div>

                    {data.paymentsCount > 0 && (
                      <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg mt-1">
                        <AlertCircle
                          size={12}
                          className="text-amber-500 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-amber-700">
                          {t("installmentHasRecordedPayments").replace(
                            "{count}",
                            String(data.paymentsCount),
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* ── Right — Edit Form ─────────────────────────────────────── */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Unsaved changes banner */}
                <AnimatePresence>
                  {hasChanges && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium overflow-hidden"
                    >
                      <AlertCircle size={15} className="flex-shrink-0" />
                      {t("youHaveUnsavedChanges")}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                    <Save size={15} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      {t("editInstallment")}
                    </h3>
                  </div>

                  <div className="px-5 py-5 flex flex-col gap-5">
                    {/* Due Date + Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <FieldLabel required>
                          <CalendarDays size={14} className="text-gray-400" />
                          {t("dueDate")}
                        </FieldLabel>
                        <Field
                          type="date"
                          name="dueDate"
                          className={inputCls(
                            !!(errors.dueDate && touched.dueDate),
                          )}
                        />
                        <ErrorMessage name="dueDate">
                          {(msg) => (
                            <p className={errCls}>
                              <AlertCircle size={11} />
                              {msg}
                            </p>
                          )}
                        </ErrorMessage>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <FieldLabel required>
                          <DollarSign size={14} className="text-gray-400" />
                          {t("installmentAmountEgp")}
                        </FieldLabel>
                        <Field
                          type="number"
                          name="installmentAmount"
                          placeholder={t("egAmountPlaceholder")}
                          min={0}
                          className={inputCls(
                            !!(
                              errors.installmentAmount &&
                              touched.installmentAmount
                            ),
                          )}
                        />
                        <ErrorMessage name="installmentAmount">
                          {(msg) => (
                            <p className={errCls}>
                              <AlertCircle size={11} />
                              {msg}
                            </p>
                          )}
                        </ErrorMessage>
                      </div>
                    </div>

                    {/* Percentage */}
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel required>
                        <Percent size={14} className="text-gray-400" />
                        {t("installmentPercentageEgp")}
                      </FieldLabel>
                      <div className="relative">
                        <Field
                          type="number"
                          name="installmentPercentage"
                          placeholder={t("egPercentagePlaceholder")}
                          min={0}
                          max={100}
                          className={inputCls(
                            !!(
                              errors.installmentPercentage &&
                              touched.installmentPercentage
                            ),
                          )}
                        />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                          %
                        </span>
                      </div>
                      <ErrorMessage name="installmentPercentage">
                        {(msg) => (
                          <p className={errCls}>
                            <AlertCircle size={11} />
                            {msg}
                          </p>
                        )}
                      </ErrorMessage>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel>
                        <FileText size={14} className="text-gray-400" />
                        {t("notes")}
                      </FieldLabel>
                      <Field
                        as="textarea"
                        name="notes"
                        rows={3}
                        placeholder={t("addNotesAboutInstallment")}
                        className={`${inputCls()} h-auto py-2.5 resize-none`}
                      />
                    </div>

                    {/* Live preview of changes */}
                    <AnimatePresence>
                      {hasChanges && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="rounded-xl border border-blue-100 bg-blue-50 overflow-hidden"
                        >
                          <p className="px-4 py-2.5 text-xs font-semibold text-blue-700 border-b border-blue-100">
                            {t("changesPreview")}
                          </p>
                          <div className="px-4 py-3 grid grid-cols-2 gap-3">
                            {[
                              {
                                label: t("dueDate"),
                                before: fmtDate(data.dueDate),
                                after: values.dueDate || "-",
                                changed:
                                  values.dueDate !== originalValues.dueDate,
                              },
                              {
                                label: t("amount"),
                                before: egp(data.installmentAmount),
                                after: values.installmentAmount
                                  ? egp(Number(values.installmentAmount))
                                  : "-",
                                changed:
                                  Number(values.installmentAmount) !==
                                  Number(originalValues.installmentAmount),
                              },
                              {
                                label: t("percentage"),
                                before: `${data.installmentPercentage}%`,
                                after: `${values.installmentPercentage || 0}%`,
                                changed:
                                  Number(values.installmentPercentage) !==
                                  Number(originalValues.installmentPercentage),
                              },
                              {
                                label: t("notes"),
                                before: data.notes || "-",
                                after: values.notes || "-",
                                changed: values.notes !== originalValues.notes,
                              },
                            ]
                              .filter((f) => f.changed)
                              .map((f) => (
                                <div
                                  key={f.label}
                                  className="flex flex-col gap-0.5"
                                >
                                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">
                                    {f.label}
                                  </p>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs text-gray-400 line-through">
                                      {f.before}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      →
                                    </span>
                                    <span className="text-xs font-semibold text-blue-700">
                                      {f.after}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to={`/dashboard/installments`}
                    className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X size={15} />
                    {t("cancel")}
                  </Link>
                  <motion.button
                    type="submit"
                    disabled={isPending || !hasChanges}
                    whileTap={{ scale: isPending || !hasChanges ? 1 : 0.97 }}
                    className={`h-10 px-6 rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:cursor-not-allowed ${
                      !hasChanges
                        ? "bg-gray-300"
                        : "bg-blue-500 hover:bg-blue-600 disabled:opacity-70"
                    }`}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        {t("saveChanges")}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

// ─── Page Wrapper ─────────────────────────────────────────────────────────────

const EditInstallmentPage = () => {
  const { t } = useLanguage();
  const { installmentId } = useParams<{ installmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch installment details — API returns { status, message, data: InstallmentDetail }
  const {
    data: installment,
    isLoading,
    isError,
  } = useQuery<InstallmentDetail>({
    queryKey: ["installment-details", installmentId],
    queryFn: async () => {
      const res = await getInstallmentForUpdate(installmentId!);
      // Support both shapes: raw flat object or wrapped { data: ... }
      return (res?.data ?? res) as InstallmentDetail;
    },
    enabled: !!installmentId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: EditInstallmentPayload) =>
      editInstallment(installmentId!, payload),
    onSuccess: () => {
      showToast("success", t("installmentUpdatedSuccessfully"));
      queryClient.invalidateQueries({
        queryKey: ["installment-details", installmentId],
      });
      setTimeout(() => navigate(`/dashboard/installments`), 1500);
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("failedToUpdateInstallmentTryAgain");
      showToast("error", msg);
    },
  });

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-72" />
            <Skeleton className="h-36" />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Skeleton className="h-56" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError || !installment) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text={t("editInstallment")} />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={36} className="text-red-300" />
          <p className="text-sm text-red-400">{t("failedToLoadInstallment")}</p>
          <Link
            to="/dashboard/institutions-contracts"
            className="text-sm text-blue-500 hover:underline"
          >
            {t("backToContracts")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Build initial form values from flat API response ──────────────────────
  const initialValues: EditInstallmentPayload = {
    dueDate: fmtDate(installment.dueDate),
    installmentAmount: installment.installmentAmount,
    installmentPercentage: installment.installmentPercentage,
    notes: installment.notes ?? "",
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
        <DashboardPageTitle text={t("editInstallment")} />

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
            to="/dashboard/institutions-contracts"
            className="hover:text-gray-600 transition-colors"
          >
            {t("contracts")}
          </Link>
          <ChevronRight size={14} />
          <Link
            to={`/dashboard/institutions-contracts/${installment.contractId}`}
            className="hover:text-gray-600 transition-colors"
          >
            {installment.contractNo}
          </Link>
          <ChevronRight size={14} />
          <Link
            to={`/dashboard/installments`}
            className="hover:text-gray-600 transition-colors"
          >
            {t("installments")}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">
            {t("editInstallment")} #{installment.installmentNo}
          </span>
        </motion.nav>

        <InnerForm
          installmentId={installmentId!}
          data={installment}
          initialValues={initialValues}
          isPending={isPending}
          onSubmit={mutate}
        />
      </div>
    </>
  );
};

export default EditInstallmentPage;
