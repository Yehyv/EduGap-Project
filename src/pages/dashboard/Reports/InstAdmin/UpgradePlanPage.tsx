import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  TrendingUp,
  Users,
  DollarSign,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: number;
  plan_name: string;
  min_students: number;
  max_students: number;
  default_price_per_student: number;
  default_installments_count: number;
  description: string;
  administrative_fees: number;
  is_active: number;
}

interface CurrentPlanData {
  currentPlan: {
    planId: number;
    planName: string;
    label: string;
    description: string;
  };
  students: {
    maxStudents: number;
    addedStudents: number;
    remainingStudents: number;
    usedPercentage: number;
  };
  financial: {
    contractValue: number;
    totalPaid: number;
    remainingAmount: number;
    paymentPercentage: number;
    totalInstallments: number;
  };
}

interface UpgradeRequestBody {
  requestedPlanId: number;
  reason: string;
  additionalStudentsNeeded: number;
  message: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchActivePlans(): Promise<Plan[]> {
  const res = await dashboardApi.get(`/subscription-plans?onlyActive=1`);
  return res.data.data ?? [];
}

async function fetchCurrentPlan(
  academicYear: number,
): Promise<CurrentPlanData | null> {
  try {
    const res = await dashboardApi.get(
      `/annual-settlements/institute/dashboard?academicYear=${academicYear}`,
    );
    return res.data.data ?? null;
  } catch (err: any) {
    const messages: string[] = err?.response?.data?.message ?? [];

    if (
      messages.some((m) =>
        m.toLowerCase().includes("no active annual contract"),
      )
    ) {
      return null;
    }

    throw err;
  }
}

async function submitUpgradeRequest(body: UpgradeRequestBody): Promise<void> {
  await dashboardApi.post(`/plan-upgrade-requests/institute`, body);
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

const inputCls = (err?: boolean) =>
  `w-full h-10 px-3 rounded-lg border text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition-colors ${
    err
      ? "border-red-300 focus:ring-red-100 focus:border-red-400"
      : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
  }`;

const errMsg = "text-xs text-red-500 flex items-center gap-1 mt-0.5";

const YEARS = [2027, 2026, 2025, 2024, 2023, 2022];

const REASONS = [
  "Need to add more students",
  "Current plan is insufficient",
  "Business growth",
  "Feature upgrade",
  "Other",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
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
    className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
      type === "success"
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-red-50 border-red-200 text-red-700"
    }`}
  >
    {type === "success" ? (
      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
    ) : (
      <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
    )}

    <span className="flex-1">{message}</span>

    <button type="button" onClick={onClose}>
      <X size={13} />
    </button>
  </motion.div>
);

// ─── Year Dropdown ────────────────────────────────────────────────────────────

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
        className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1.5"
      >
        {value}

        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20"
          >
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  onChange(y);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs text-left transition-colors ${
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

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
      <Icon size={9} />
      {label}
    </p>

    <p className="text-sm font-bold text-gray-800">{value}</p>
  </div>
);

// ─── Left Sidebar ─────────────────────────────────────────────────────────────

const LeftSidebar = ({
  academicYear,
  onYearChange,
  selectedPlan,
}: {
  academicYear: number;
  onYearChange: (y: number) => void;
  selectedPlan: Plan | null;
}) => {
  const { t } = useLanguage();

  const { data: currentData, isLoading } = useQuery({
    queryKey: ["current-plan-for-upgrade", academicYear],
    queryFn: () => fetchCurrentPlan(academicYear),
    retry: false,
  });

  // Once user picks a plan from the dropdown, show that;
  // otherwise show the current plan from API
  if (selectedPlan) {
    return (
      <motion.div
        {...fadeUp(0.06)}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <TrendingUp size={13} className="text-gray-400" />

            <h3 className="text-sm font-semibold text-gray-800">
              {t("selected-plan")}
            </h3>
          </div>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-400 font-medium">
              {t("plan-name")}
            </p>

            <p className="text-base font-bold text-gray-800">
              {selectedPlan.plan_name}
            </p>
          </div>

          {selectedPlan.description && (
            <>
              <div className="border-t border-gray-50" />

              <p className="text-xs text-gray-500 leading-relaxed">
                {selectedPlan.description}
              </p>
            </>
          )}

          <div className="border-t border-gray-50" />

          <InfoRow
            icon={Users}
            label={t("max-students")}
            value={selectedPlan.max_students.toLocaleString()}
          />

          <div className="border-t border-gray-50" />

          <InfoRow
            icon={DollarSign}
            label={t("price-per-student")}
            value={egp(selectedPlan.default_price_per_student)}
          />

          <div className="border-t border-gray-50" />

          <InfoRow
            icon={ListChecks}
            label={t("installments")}
            value={selectedPlan.default_installments_count}
          />

          {selectedPlan.administrative_fees > 0 && (
            <>
              <div className="border-t border-gray-50" />

              <InfoRow
                icon={DollarSign}
                label={t("admin-fees")}
                value={egp(selectedPlan.administrative_fees)}
              />
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...fadeUp(0.06)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-gray-400" />

          <h3 className="text-sm font-semibold text-gray-800">
            {t("current-plan")}
          </h3>
        </div>

        <YearDropdown value={academicYear} onChange={onYearChange} />
      </div>

      <div className="px-5 py-5 flex flex-col gap-4">
        {isLoading && (
          <>
            <Sk className="h-5 w-24" />
            <Sk className="h-4 w-32" />
            <Sk className="h-4 w-28" />
            <Sk className="h-4 w-20" />
          </>
        )}

        {!isLoading && !currentData && (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <TrendingUp size={22} className="text-gray-200" />

            <p className="text-xs text-gray-400">
              {t("no-active-contract-for-year", {
                year: academicYear,
              })}
            </p>
          </div>
        )}

        {!isLoading && currentData && (
          <>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-400 font-medium">
                {t("plan-name")}
              </p>

              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-gray-800">
                  {currentData.currentPlan.planName}
                </p>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  {currentData.currentPlan.label}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-50" />

            <InfoRow
              icon={Users}
              label={t("max-students")}
              value={currentData.students.maxStudents.toLocaleString()}
            />

            <div className="border-t border-gray-50" />

            <InfoRow
              icon={Users}
              label={t("added-students")}
              value={currentData.students.addedStudents.toLocaleString()}
            />

            <div className="border-t border-gray-50" />

            <InfoRow
              icon={DollarSign}
              label={t("contract-value")}
              value={egp(currentData.financial.contractValue)}
            />

            <div className="border-t border-gray-50" />

            <InfoRow
              icon={ListChecks}
              label={t("installments")}
              value={currentData.financial.totalInstallments}
            />

            {/* Usage progress */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-gray-400 font-medium">
                  {t("student-usage")}
                </p>

                <p className="text-[11px] font-semibold text-gray-600">
                  {currentData.students.usedPercentage}%
                </p>
              </div>

              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      currentData.students.usedPercentage,
                      100,
                    )}%`,
                  }}
                  transition={{
                    delay: 0.4,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const UpgradePlanPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });

    setTimeout(() => setToast(null), 4500);
  };

  const {
    data: plans = [],
    isLoading: plansLoading,
    isError: plansError,
  } = useQuery({
    queryKey: ["active-plans"],
    queryFn: fetchActivePlans,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: submitUpgradeRequest,

    onSuccess: () => {
      showToast("success", t("upgrade-request-submitted-successfully"));

      setTimeout(() => navigate("/dashboard/home"), 1800);
    },

    onError: (err: any) => {
      const msg =
        err?.response?.data?.message?.[0] ??
        err?.response?.data?.message ??
        t("failed-to-submit-request");

      showToast("error", typeof msg === "string" ? msg : JSON.stringify(msg));
    },
  });

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

      <DashboardPageTitle text={t("request-plan-upgrade")} />

      <div className="flex flex-col gap-5 pb-8">
        {/* Breadcrumb */}
        <motion.nav
          {...fadeUp(0)}
          className="flex items-center gap-1.5 text-sm text-gray-400"
        >
          <Link
            to="/dashboard/home"
            className="hover:text-gray-600 transition-colors"
          >
            {t("dashboard")}
          </Link>

          <ChevronRight size={13} />

          <span className="text-gray-600 font-medium">
            {t("request-upgrade")}
          </span>
        </motion.nav>

        {plansLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Sk className="h-64" />

            <div className="lg:col-span-2">
              <Sk className="h-80" />
            </div>
          </div>
        )}

        {plansError && !plansLoading && (
          <motion.div
            {...fadeUp(0.05)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3"
          >
            <AlertCircle size={32} className="text-red-300" />

            <p className="text-sm text-red-400">
              {t("failed-to-load-plans-please-try-again")}
            </p>
          </motion.div>
        )}

        {!plansLoading && !plansError && (
          <Formik
            initialValues={{
              requestedPlanId: 0,
              reason: "",
              additionalStudentsNeeded: "" as unknown as number,
              message: "",
            }}
            validationSchema={Yup.object({
              requestedPlanId: Yup.number()
                .min(1, t("please-select-a-plan"))
                .required(t("please-select-a-plan")),

              reason: Yup.string().required(t("please-select-a-reason")),

              additionalStudentsNeeded: Yup.number()
                .typeError(t("enter-a-valid-number"))
                .min(1, t("must-be-at-least-1"))
                .required(t("this-field-is-required")),

              message: Yup.string(),
            })}
            onSubmit={(values) => {
              mutate({
                requestedPlanId: Number(values.requestedPlanId),
                reason: values.reason,
                additionalStudentsNeeded: Number(
                  values.additionalStudentsNeeded,
                ),
                message: values.message,
              });
            }}
          >
            {({ errors, touched, setFieldValue }) => (
              <Form>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                  {/* Left sidebar — current plan or selected plan preview */}
                  <LeftSidebar
                    academicYear={academicYear}
                    onYearChange={setAcademicYear}
                    selectedPlan={selectedPlan}
                  />

                  {/* Right — form */}
                  <motion.div
                    {...fadeUp(0.1)}
                    className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-6 flex flex-col gap-5">
                      {/* Select New Plan */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          {t("select-new-plan")}{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <Field
                          as="select"
                          name="requestedPlanId"
                          className={`${inputCls(
                            !!(
                              errors.requestedPlanId && touched.requestedPlanId
                            ),
                          )} appearance-none`}
                          onChange={(
                            e: React.ChangeEvent<HTMLSelectElement>,
                          ) => {
                            const id = Number(e.target.value);

                            setFieldValue("requestedPlanId", id);

                            setSelectedPlan(
                              id > 0
                                ? (plans.find((p) => p.id === id) ?? null)
                                : null,
                            );
                          }}
                        >
                          <option value={0}>{t("select-a-plan")}</option>

                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.plan_name} ({p.max_students.toLocaleString()}{" "}
                              {t("students")})
                            </option>
                          ))}
                        </Field>

                        <ErrorMessage name="requestedPlanId">
                          {(msg) => (
                            <p className={errMsg}>
                              <AlertCircle size={11} />
                              {msg}
                            </p>
                          )}
                        </ErrorMessage>
                      </div>

                      {/* Reason */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          {t("reason-for-upgrade")}{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <Field
                          as="select"
                          name="reason"
                          className={`${inputCls(
                            !!(errors.reason && touched.reason),
                          )} appearance-none`}
                        >
                          <option value="">{t("select-a-reason")}</option>

                          {REASONS.map((r) => (
                            <option key={r} value={r}>
                              {t(
                                r === "Need to add more students"
                                  ? "need-to-add-more-students"
                                  : r === "Current plan is insufficient"
                                    ? "current-plan-is-insufficient"
                                    : r === "Business growth"
                                      ? "business-growth"
                                      : r === "Feature upgrade"
                                        ? "feature-upgrade"
                                        : "other",
                              )}
                            </option>
                          ))}
                        </Field>

                        <ErrorMessage name="reason">
                          {(msg) => (
                            <p className={errMsg}>
                              <AlertCircle size={11} />
                              {msg}
                            </p>
                          )}
                        </ErrorMessage>
                      </div>

                      {/* Additional Students */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          {t("additional-students-needed")}{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <Field
                          type="number"
                          name="additionalStudentsNeeded"
                          placeholder={t("e-g-3000")}
                          min={1}
                          className={inputCls(
                            !!(
                              errors.additionalStudentsNeeded &&
                              touched.additionalStudentsNeeded
                            ),
                          )}
                        />

                        <ErrorMessage name="additionalStudentsNeeded">
                          {(msg) => (
                            <p className={errMsg}>
                              <AlertCircle size={11} />
                              {msg}
                            </p>
                          )}
                        </ErrorMessage>
                      </div>

                      {/* Message */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          {t("message")}{" "}
                          <span className="text-xs text-gray-400 font-normal">
                            ({t("optional")})
                          </span>
                        </label>

                        <Field
                          as="textarea"
                          name="message"
                          rows={4}
                          placeholder={t(
                            "e-g-we-are-growing-and-need-to-increase-our-student-limit",
                          )}
                          className={`${inputCls()} h-auto py-2.5 resize-none`}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                      <Link
                        to="/dashboard/home"
                        className="h-10 px-6 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <X size={14} /> {t("cancel")}
                      </Link>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="h-10 px-6 rounded-xl bg-secondary hover:bg-secondary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        {isPending ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />{" "}
                            {t("submitting")}
                          </>
                        ) : (
                          <>
                            <TrendingUp size={14} /> {t("submit-request")}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </>
  );
};

export default UpgradePlanPage;
