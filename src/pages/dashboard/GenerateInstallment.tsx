import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Building2,
  CalendarDays,
  CreditCard,
  Info,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Zap,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  fetchContractById,
  generateInstallments,
} from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenerateInstallmentsPayload {
  firstDueDate: string;
  intervalMonths: number;
  force: boolean;
}

interface PreviewInstallment {
  no: number;
  dueDate: string;
  amount: number;
  percentage: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INSTALLMENT_COUNT_OPTIONS = [1, 2, 3, 4, 6, 8, 12];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number) =>
  `${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const addMonths = (dateStr: string, months: number): string => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};

const buildPreview = (
  firstDueDate: string,
  count: number,
  intervalMonths: number,
  totalAmount: number,
): PreviewInstallment[] => {
  if (!firstDueDate || count < 1 || intervalMonths < 1 || totalAmount <= 0)
    return [];
  const perInstallment = totalAmount / count;
  const pct = Math.round(100 / count);
  return Array.from({ length: count }, (_, i) => ({
    no: i + 1,
    dueDate: addMonths(firstDueDate, i * intervalMonths),
    amount: perInstallment,
    percentage: i === count - 1 ? 100 - pct * (count - 1) : pct,
  }));
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
  <label className="text-sm font-medium text-gray-700 flex items-center gap-0.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const selectClass =
  "w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors cursor-pointer appearance-none";

const inputClass =
  "w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors";

const errorClass = "text-xs text-red-500 flex items-center gap-1 mt-0.5";

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
    transition={{ duration: 0.25 }}
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
    <button onClick={onClose} className="hover:opacity-70 flex-shrink-0">
      <X size={14} />
    </button>
  </motion.div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const GenerateInstallments = () => {
  const { t } = useLanguage();
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const validationSchema = Yup.object({
    numberOfInstallments: Yup.number()
      .min(1, t("mustBeAtLeastOne"))
      .max(24, t("max24Installments"))
      .required(t("required")),
    firstDueDate: Yup.string().required(t("firstDueDateRequired")),
    intervalMonths: Yup.number()
      .min(1, t("mustBeAtLeastOneMonth"))
      .required(t("required")),
    force: Yup.boolean(),
  });

  const FREQUENCY_OPTIONS = [
    { label: t("everyMonth"), value: 1 },
    { label: t("every2Months"), value: 2 },
    { label: t("every3Months"), value: 3 },
    { label: t("every4Months"), value: 4 },
    { label: t("every6Months"), value: 6 },
    { label: t("every12Months"), value: 12 },
  ];

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch contract ─────────────────────────────────────────────────────────
  const { data: contractData, isLoading } = useQuery({
    queryKey: ["institute-annual-contract", contractId],
    queryFn: () => fetchContractById(contractId!),
    enabled: !!contractId,
  });

  const contract = contractData;

  // ── Mutation ───────────────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: GenerateInstallmentsPayload) =>
      generateInstallments(contractId!, payload),
    onSuccess: () => {
      showToast("success", t("installmentsGeneratedSuccessfully"));
      setTimeout(
        () => navigate(`/dashboard/institutions-contracts/${contractId}`),
        1500,
      );
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("failedToGenerateInstallmentsTryAgain");
      showToast("error", msg);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-56" />
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = contract?.contractInfo?.totalAmount ?? 0;
  const installmentsCount = contract?.contractInfo?.installmentsCount ?? 4;
  const contractNo = contract?.header?.contractNo ?? `CON-${contractId}`;
  const instituteName = contract?.header?.institute?.name ?? "-";
  const year = contract?.header?.academicYear ?? "-";
  const planName = contract?.header?.plan?.name ?? "-";

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
        <DashboardPageTitle text={t("generateInstallments")} />

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
          <span className="text-gray-600">{t("generateInstallments")}</span>
        </motion.nav>

        <Formik
          initialValues={{
            numberOfInstallments: installmentsCount,
            firstDueDate: "",
            intervalMonths: 3,
            force: false,
          }}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values) => {
            mutate({
              firstDueDate: values.firstDueDate,
              intervalMonths: values.intervalMonths,
              force: values.force,
            });
          }}
        >
          {({ values, setFieldValue, errors, touched }) => {
            // ── Live preview ───────────────────────────────────────────────
            const preview = useMemo(
              () =>
                buildPreview(
                  values.firstDueDate,
                  values.numberOfInstallments,
                  values.intervalMonths,
                  totalAmount,
                ),
              [
                values.firstDueDate,
                values.numberOfInstallments,
                values.intervalMonths,
                totalAmount,
              ],
            );

            return (
              <Form>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                  {/* ── Left — Contract Info ──────────────────────────────── */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.35 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                      <Building2 size={15} className="text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        {t("contractInformation")}
                      </h3>
                    </div>
                    <div className="px-5 py-5 flex flex-col gap-4">
                      <InfoField label={t("contractNo")} value={contractNo} />
                      <div className="border-t border-gray-50" />
                      <InfoField label={t("institute")} value={instituteName} />
                      <div className="border-t border-gray-50" />
                      <InfoField label={t("year")} value={year} />
                      <div className="border-t border-gray-50" />
                      <InfoField label={t("plan")} value={planName} />
                      <div className="border-t border-gray-50" />
                      <InfoField
                        label={t("totalAmountEgp")}
                        value={egp(totalAmount)}
                      />
                      <div className="border-t border-gray-50" />
                      <InfoField
                        label={t("installments")}
                        value={installmentsCount}
                      />
                    </div>
                  </motion.div>

                  {/* ── Right — Form + Preview ────────────────────────────── */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Form card */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14, duration: 0.35 }}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                        <Zap size={15} className="text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-800">
                          {t("generateInstallments")}
                        </h3>
                      </div>

                      <div className="px-5 py-5 flex flex-col gap-4">
                        {/* Row 1 — Count + First Due Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Number of installments */}
                          <div className="flex flex-col gap-1.5">
                            <FieldLabel required>
                              {t("numberOfInstallments")}
                            </FieldLabel>
                            <div className="relative">
                              <Field
                                as="select"
                                disabled={true}
                                name="numberOfInstallments"
                                className={`${selectClass} !bg-gray-100 !cursor-not-allowed ${
                                  errors.numberOfInstallments &&
                                  touched.numberOfInstallments
                                    ? "border-red-300 focus:ring-red-100"
                                    : ""
                                }`}
                              >
                                {INSTALLMENT_COUNT_OPTIONS.map((n) => (
                                  <option key={n} value={n}>
                                    {n}{" "}
                                    {n > 1
                                      ? t("installments")
                                      : t("installment")}
                                  </option>
                                ))}
                              </Field>
                              <ChevronRight
                                size={13}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                              />
                            </div>
                            <ErrorMessage name="numberOfInstallments">
                              {(msg) => (
                                <p className={errorClass}>
                                  <AlertCircle size={11} />
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>

                          {/* First due date */}
                          <div className="flex flex-col gap-1.5">
                            <FieldLabel required>
                              {t("firstInstallmentDueDate")}
                            </FieldLabel>
                            <div className="relative">
                              <Field
                                type="date"
                                name="firstDueDate"
                                className={`${inputClass} ${
                                  errors.firstDueDate && touched.firstDueDate
                                    ? "border-red-300 focus:ring-red-100"
                                    : ""
                                }`}
                              />
                              <CalendarDays
                                size={14}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              />
                            </div>
                            <ErrorMessage name="firstDueDate">
                              {(msg) => (
                                <p className={errorClass}>
                                  <AlertCircle size={11} />
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>
                        </div>

                        {/* Row 2 — Frequency */}
                        <div className="flex flex-col gap-1.5">
                          <FieldLabel required>
                            {t("installmentFrequency")}
                          </FieldLabel>
                          <div className="relative">
                            <Field
                              as="select"
                              name="intervalMonths"
                              className={`${selectClass} ${
                                errors.intervalMonths && touched.intervalMonths
                                  ? "border-red-300 focus:ring-red-100"
                                  : ""
                              }`}
                            >
                              {FREQUENCY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Field>
                            <ChevronRight
                              size={13}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                            />
                          </div>
                          <ErrorMessage name="intervalMonths">
                            {(msg) => (
                              <p className={errorClass}>
                                <AlertCircle size={11} />
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        {/* Info banner */}
                        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                          <Info
                            size={14}
                            className="text-blue-400 flex-shrink-0"
                          />
                          <p className="text-xs text-blue-600">
                            {t("installmentsGeneratedAutomaticallyEqual")}
                          </p>
                        </div>

                        {/* Force toggle */}
                        <div className="flex items-start gap-3 px-3.5 py-3 bg-amber-50 border border-amber-100 rounded-lg">
                          <div className="pt-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                setFieldValue("force", !values.force)
                              }
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                                values.force ? "bg-amber-500" : "bg-gray-300"
                              }`}
                            >
                              <motion.span
                                layout
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                                className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow"
                                style={{ x: values.force ? 18 : 3 }}
                              />
                            </button>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-amber-700">
                              {t("forceRegenerate")}
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              {t("forceRegenerateDescription")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Preview card */}
                    <AnimatePresence>
                      {preview.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                            <CreditCard size={15} className="text-gray-400" />
                            <h3 className="text-sm font-semibold text-gray-800">
                              {t("preview")}
                            </h3>
                            <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                              {preview.length}
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                  {[
                                    "#",
                                    t("dueDate"),
                                    t("installmentAmountEgp"),
                                    t("percentage"),
                                  ].map((h) => (
                                    <th
                                      key={h}
                                      className="px-5 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {preview.map((row, i) => (
                                  <motion.tr
                                    key={row.no}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      delay: i * 0.04,
                                      duration: 0.22,
                                    }}
                                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-5 py-3.5 text-center text-sm text-gray-500">
                                      {row.no}
                                    </td>
                                    <td className="px-5 py-3.5 text-center text-sm font-medium text-gray-700">
                                      {row.dueDate}
                                    </td>
                                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-gray-800">
                                      {egp(row.amount)}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                        {row.percentage}%
                                      </span>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-between pt-1"
                    >
                      <Link
                        to={`/dashboard/institutions-contracts/${contractId}`}
                        className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <X size={15} />
                        {t("cancel")}
                      </Link>

                      <motion.button
                        type="submit"
                        disabled={isPending}
                        whileTap={{ scale: isPending ? 1 : 0.97 }}
                        className="h-10 px-6 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isPending ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            {t("generating")}
                          </>
                        ) : (
                          <>
                            <Zap size={15} />
                            {t("generateInstallments")}
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </>
  );
};

export default GenerateInstallments;
