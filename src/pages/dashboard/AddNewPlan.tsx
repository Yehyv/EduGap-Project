import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Tag,
  Users,
  DollarSign,
  Receipt,
  CalendarDays,
  AlignLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  X,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createSubscriptionPlan } from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFormData {
  plan_name: string;
  min_students: string;
  max_students: string;
  default_price_per_student: string;
  administrative_fees: string;
  default_installments_count: string;
  is_active: boolean;
  description: string;
}

interface FormErrors {
  plan_name?: string;
  min_students?: string;
  max_students?: string;
  default_price_per_student?: string;
  administrative_fees?: string;
  default_installments_count?: string;
}

const INSTALLMENT_OPTIONS = ["1", "2", "3", "4", "6", "12"];

const INITIAL_FORM: PlanFormData = {
  plan_name: "",
  min_students: "",
  max_students: "",
  default_price_per_student: "",
  administrative_fees: "",
  default_installments_count: "",
  is_active: true,
  description: "",
};

// ─── Field ────────────────────────────────────────────────────────────────────

const Field = ({
  label,
  required,
  error,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col gap-1.5"
  >
    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-red-500 flex items-center gap-1"
        >
          <AlertCircle size={11} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </motion.div>
);

const inputClass = (hasError?: boolean) =>
  `w-full h-10 px-3 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors bg-white ${
    hasError
      ? "border-red-300 focus:ring-red-100 focus:border-red-400"
      : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
  }`;

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -12, scale: 0.96 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
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
    {message}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AddSubscriptionPlan = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState<PlanFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ─── Validate ─────────────────────────────────────────────────────────────
  const validate = (form: PlanFormData): FormErrors => {
    const errors: FormErrors = {};
    if (!form.plan_name.trim()) errors.plan_name = t("planNameRequired");
    if (!form.min_students) errors.min_students = t("minStudentsRequired");
    if (!form.max_students) errors.max_students = t("maxStudentsRequired");
    if (Number(form.min_students) >= Number(form.max_students))
      errors.max_students = t("maxMustBeGreaterThanMin");
    if (!form.default_price_per_student)
      errors.default_price_per_student = t("priceRequired");
    if (!form.administrative_fees)
      errors.administrative_fees = t("administrativeFeesRequired");
    if (!form.default_installments_count)
      errors.default_installments_count = t("installmentsRequired");
    return errors;
  };

  const set = (key: keyof PlanFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      showToast("success", t("subscriptionPlanCreatedSuccessfully"));
      setTimeout(() => navigate("/dashboard/subscription-plans"), 1500);
    },
    onError: () => {
      showToast("error", t("failedToCreatePlanTryAgain"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    mutate({
      plan_name: form.plan_name.trim(),
      min_students: Number(form.min_students),
      max_students: Number(form.max_students),
      default_price_per_student: Number(form.default_price_per_student),
      administrative_fees: Number(form.administrative_fees),
      default_installments_count: Number(form.default_installments_count),
      is_active: form.is_active,
      description: form.description.trim(),
    });
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast type={toast.type} message={toast.message} />}
      </AnimatePresence>

      <div className="flex flex-col gap-5">
        <DashboardPageTitle text={t("addSubscriptionPlan")} />

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
            to="/dashboard/subscription-plans"
            className="hover:text-gray-600 transition-colors"
          >
            {t("subscriptionPlans")}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">{t("addNewPlan")}</span>
        </motion.nav>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Row 1 — Plan Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label={t("planName")}
                required
                error={errors.plan_name}
                icon={<Tag size={14} />}
              >
                <input
                  type="text"
                  placeholder={t("enterPlanName")}
                  className={inputClass(!!errors.plan_name)}
                  value={form.plan_name}
                  onChange={(e) => set("plan_name", e.target.value)}
                />
              </Field>
            </div>

            {/* Row 2 — Students + Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                label={t("minStudents")}
                required
                error={errors.min_students}
                icon={<Users size={14} />}
              >
                <input
                  type="number"
                  placeholder={t("egZero")}
                  className={inputClass(!!errors.min_students)}
                  value={form.min_students}
                  onChange={(e) => set("min_students", e.target.value)}
                  min={0}
                />
              </Field>

              <Field
                label={t("maxStudents")}
                required
                error={errors.max_students}
                icon={<Users size={14} />}
              >
                <input
                  type="number"
                  placeholder={t("egOneThousand")}
                  className={inputClass(!!errors.max_students)}
                  value={form.max_students}
                  onChange={(e) => set("max_students", e.target.value)}
                  min={0}
                />
              </Field>

              <Field
                label={t("pricePerStudentEGP")}
                required
                error={errors.default_price_per_student}
                icon={<DollarSign size={14} />}
              >
                <input
                  type="number"
                  placeholder={t("egTwoHundred")}
                  className={inputClass(!!errors.default_price_per_student)}
                  value={form.default_price_per_student}
                  onChange={(e) =>
                    set("default_price_per_student", e.target.value)
                  }
                  min={0}
                />
              </Field>
            </div>

            {/* Row 3 — Fees + Installments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label={t("administrativeFees")}
                required
                error={errors.administrative_fees}
                icon={<Receipt size={14} />}
              >
                <input
                  type="number"
                  placeholder={t("egFiveHundred")}
                  className={inputClass(!!errors.administrative_fees)}
                  value={form.administrative_fees}
                  onChange={(e) => set("administrative_fees", e.target.value)}
                  min={0}
                />
              </Field>

              <Field
                label={t("defaultInstallments")}
                required
                error={errors.default_installments_count}
                icon={<CalendarDays size={14} />}
              >
                <select
                  className={`${inputClass(!!errors.default_installments_count)} cursor-pointer`}
                  value={form.default_installments_count}
                  onChange={(e) =>
                    set("default_installments_count", e.target.value)
                  }
                >
                  <option value="" disabled>
                    {t("selectInstallments")}
                  </option>
                  {INSTALLMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Row 4 — Description */}
            <Field label={t("description")} icon={<AlignLeft size={14} />}>
              <textarea
                placeholder={t("enterPlanDescription")}
                rows={4}
                className={`${inputClass()} h-auto py-2.5 resize-none`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Link
                to="/dashboard/subscription-plans"
                className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X size={15} />
                {t("cancel")}
              </Link>
              <motion.button
                type="submit"
                disabled={isPending}
                whileTap={{ scale: isPending ? 1 : 0.97 }}
                className="h-10 px-6 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    {t("savePlan")}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default AddSubscriptionPlan;
