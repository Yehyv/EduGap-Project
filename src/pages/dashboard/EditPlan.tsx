import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import {
  fetchPlanById,
  updateSubscriptionPlan,
} from "@/features/Dashboard/services/dashboardApis";

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

const EMPTY_FORM: PlanFormData = {
  plan_name: "",
  min_students: "",
  max_students: "",
  default_price_per_student: "",
  administrative_fees: "",
  default_installments_count: "",
  is_active: true,
  description: "",
};

// ─── Validate ─────────────────────────────────────────────────────────────────

const validate = (form: PlanFormData): FormErrors => {
  const errors: FormErrors = {};
  if (!form.plan_name.trim()) errors.plan_name = "Plan name is required";
  if (!form.min_students) errors.min_students = "Min students is required";
  if (!form.max_students) errors.max_students = "Max students is required";
  if (Number(form.min_students) >= Number(form.max_students))
    errors.max_students = "Max must be greater than min";
  if (!form.default_price_per_student)
    errors.default_price_per_student = "Price is required";
  if (!form.administrative_fees)
    errors.administrative_fees = "Administrative fees is required";
  if (!form.default_installments_count)
    errors.default_installments_count = "Installments is required";
  return errors;
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? "bg-secondary" : "bg-gray-300"
    }`}
  >
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="inline-block h-4 w-4 rounded-full bg-white shadow"
      style={{ x: checked ? 24 : 4 }}
    />
  </button>
);

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
  type: "success" | "error" | "warning";
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
        : type === "warning"
          ? "bg-amber-50 border-amber-200 text-amber-700"
          : "bg-red-50 border-red-200 text-red-700"
    }`}
  >
    {type === "success" ? (
      <CheckCircle2 size={17} className="text-green-500 flex-shrink-0" />
    ) : type === "warning" ? (
      <AlertCircle size={17} className="text-amber-500 flex-shrink-0" />
    ) : (
      <AlertCircle size={17} className="text-red-500 flex-shrink-0" />
    )}
    {message}
  </motion.div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EditSubscriptionPlan = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<PlanFormData>(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState<PlanFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // ── Fetch existing plan ────────────────────────────────────────────────────
  const {
    data: planData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subscription-plan", planId],
    queryFn: () => fetchPlanById(planId!),
    enabled: !!planId,
  });

  // ── Populate form + snapshot once data arrives ─────────────────────────────
  useEffect(() => {
    const plan = planData?.data;
    if (!plan) return;
    const mapped: PlanFormData = {
      plan_name: plan.plan_name,
      min_students: String(plan.min_students),
      max_students: String(plan.max_students),
      default_price_per_student: String(plan.default_price_per_student),
      administrative_fees: String(plan.administrative_fees),
      default_installments_count: String(plan.default_installments_count),
      is_active: Boolean(plan.is_active),
      description: plan.description ?? "",
    };
    setForm(mapped);
    setOriginalForm(mapped);
  }, [planData]);

  // ── Dirty check ────────────────────────────────────────────────────────────
  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(originalForm),
    [form, originalForm],
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (key: keyof PlanFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const showToast = (
    type: "success" | "error" | "warning",
    message: string,
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Mutation ───────────────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof updateSubscriptionPlan>[1]) =>
      updateSubscriptionPlan(planId!, data),
    onSuccess: () => {
      showToast("success", "Plan updated successfully!");
      setTimeout(() => navigate("/dashboard/subscription-plans"), 1500);
    },
    onError: () => {
      showToast("error", "Failed to update plan. Please try again.");
    },
  });

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) {
      showToast("warning", "No changes made.");
      return;
    }
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
      is_active: form.is_active ? 1 : 0,
      description: form.description.trim(),
    });
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-72" />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError || !planData?.data) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text="Edit Subscription Plan" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-3"
        >
          <AlertCircle size={36} className="text-red-300" />
          <p className="text-sm font-medium text-red-400">
            Failed to load plan. Please try again.
          </p>
          <Link
            to="/dashboard/subscription-plans"
            className="text-sm text-blue-500 hover:underline"
          >
            Back to Plans
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast type={toast.type} message={toast.message} />}
      </AnimatePresence>

      <div className="flex flex-col gap-5">
        <DashboardPageTitle text="Edit Subscription Plan" />

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
            to="/dashboard/subscription-plans"
            className="hover:text-gray-600 transition-colors"
          >
            Subscription Plans
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">Edit Plan</span>
        </motion.nav>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          {/* Unsaved changes banner */}
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium overflow-hidden"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                You have unsaved changes
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Row 1 — Name + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Plan Name"
                required
                error={errors.plan_name}
                icon={<Tag size={14} />}
              >
                <input
                  type="text"
                  placeholder="Enter plan name"
                  className={inputClass(!!errors.plan_name)}
                  value={form.plan_name}
                  onChange={(e) => set("plan_name", e.target.value)}
                />
              </Field>

              <Field label="Status" icon={<CheckCircle2 size={14} />}>
                <div className="flex items-center gap-3 h-10">
                  <Toggle
                    checked={form.is_active}
                    onChange={(val) => set("is_active", val)}
                  />
                  <motion.span
                    key={form.is_active ? "active" : "inactive"}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm font-semibold ${
                      form.is_active ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {form.is_active ? "Active" : "Inactive"}
                  </motion.span>
                </div>
              </Field>
            </div>

            {/* Row 2 — Min + Max + Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                label="Min Students"
                required
                error={errors.min_students}
                icon={<Users size={14} />}
              >
                <input
                  type="number"
                  placeholder="e.g. 0"
                  className={inputClass(!!errors.min_students)}
                  value={form.min_students}
                  onChange={(e) => set("min_students", e.target.value)}
                  min={0}
                />
              </Field>

              <Field
                label="Max Students"
                required
                error={errors.max_students}
                icon={<Users size={14} />}
              >
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  className={inputClass(!!errors.max_students)}
                  value={form.max_students}
                  onChange={(e) => set("max_students", e.target.value)}
                  min={0}
                />
              </Field>

              <Field
                label="Price Per Student (EGP)"
                required
                error={errors.default_price_per_student}
                icon={<DollarSign size={14} />}
              >
                <input
                  type="number"
                  placeholder="e.g. 200"
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
                label="Administrative Fees"
                required
                error={errors.administrative_fees}
                icon={<Receipt size={14} />}
              >
                <input
                  type="number"
                  placeholder="e.g. 500"
                  className={inputClass(!!errors.administrative_fees)}
                  value={form.administrative_fees}
                  onChange={(e) => set("administrative_fees", e.target.value)}
                  min={0}
                />
              </Field>

              <Field
                label="Default Installments"
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
                    Select installments
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
            <Field label="Description" icon={<AlignLeft size={14} />}>
              <textarea
                placeholder="Enter plan description..."
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
                Cancel
              </Link>
              <motion.button
                type="submit"
                disabled={isPending || !hasChanges}
                whileTap={{ scale: isPending || !hasChanges ? 1 : 0.97 }}
                className={`h-10 px-6 rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:cursor-not-allowed ${
                  !hasChanges
                    ? "bg-gray-300"
                    : "bg-secondary hover:bg-secondary/80 disabled:opacity-70"
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
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

export default EditSubscriptionPlan;
