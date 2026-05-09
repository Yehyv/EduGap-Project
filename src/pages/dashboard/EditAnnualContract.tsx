import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Building2,
  FileText,
  Receipt,
  Info,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Institute {
  id: number;
  name: string;
}

interface Plan {
  id: number;
  name: string;
  maxStudents: number;
  pricePerStudent: number;
  administrativeFees: number;
  installments: number;
}

interface ContractFormData {
  instituteId: string;
  academicYear: string;
  planId: string;
  discount: string;
  tax: string;
  notes: string;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_INSTITUTES: Institute[] = [
  { id: 1, name: "Almarefa Institute" },
  { id: 2, name: "Attamia Institute" },
  { id: 3, name: "Future Academy" },
  { id: 4, name: "Smart Learning Institute" },
  { id: 5, name: "Knowledge House" },
  { id: 6, name: "Success Academy" },
  { id: 7, name: "Nile Learning Center" },
  { id: 8, name: "Cairo Digital Academy" },
];

const DUMMY_PLANS: Plan[] = [
  {
    id: 1,
    name: "Starter Plan",
    maxStudents: 500,
    pricePerStudent: 200,
    administrativeFees: 0,
    installments: 4,
  },
  {
    id: 2,
    name: "Growth Plan",
    maxStudents: 2000,
    pricePerStudent: 180,
    administrativeFees: 0,
    installments: 4,
  },
  {
    id: 3,
    name: "Enterprise Plan",
    maxStudents: 10000,
    pricePerStudent: 150,
    administrativeFees: 0,
    installments: 6,
  },
  {
    id: 4,
    name: "Gold Plan",
    maxStudents: 20000,
    pricePerStudent: 190,
    administrativeFees: 11,
    installments: 5,
  },
];

// Dummy existing contracts to simulate GET /contracts/:id
const DUMMY_CONTRACTS: Record<string, ContractFormData> = {
  "1": {
    instituteId: "1",
    academicYear: "2025",
    planId: "2",
    discount: "5",
    tax: "14",
    notes: "Renewal contract for 2025 academic year.",
  },
  "2": {
    instituteId: "2",
    academicYear: "2025",
    planId: "1",
    discount: "0",
    tax: "14",
    notes: "",
  },
  "3": {
    instituteId: "3",
    academicYear: "2025",
    planId: "3",
    discount: "10",
    tax: "14",
    notes: "Special enterprise agreement.",
  },
  "4": {
    instituteId: "4",
    academicYear: "2024",
    planId: "2",
    discount: "0",
    tax: "14",
    notes: "Closed contract — 2024.",
  },
};

const ACADEMIC_YEARS = ["2024", "2025", "2026", "2027"];

const EMPTY_FORM: ContractFormData = {
  instituteId: "",
  academicYear: "2025",
  planId: "",
  discount: "0",
  tax: "14",
  notes: "",
};

// ─── Field ────────────────────────────────────────────────────────────────────

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const selectClass =
  "w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors cursor-pointer appearance-none";

// ─── Section Card ─────────────────────────────────────────────────────────────

const SectionCard = ({
  number,
  title,
  icon,
  children,
  delay = 0,
}: {
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: "easeOut" }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
      <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-5 flex flex-col gap-4">{children}</div>
  </motion.div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

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
    ) : (
      <AlertCircle
        size={17}
        className={`flex-shrink-0 ${type === "warning" ? "text-amber-500" : "text-red-500"}`}
      />
    )}
    {message}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EditAnnualContract = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<ContractFormData>(EMPTY_FORM);
  const [originalForm, setOriginalForm] =
    useState<ContractFormData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // ── Simulate GET /contracts/:id ────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const existing = DUMMY_CONTRACTS[contractId ?? ""];
      if (existing) {
        setForm(existing);
        setOriginalForm(existing);
        setIsLoading(false);
      } else {
        setIsError(true);
        setIsLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [contractId]);

  // ── Dirty check ────────────────────────────────────────────────────────────
  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(originalForm),
    [form, originalForm],
  );

  const set = (key: keyof ContractFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const showToast = (
    type: "success" | "error" | "warning",
    message: string,
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const selectedPlan =
    DUMMY_PLANS.find((p) => String(p.id) === form.planId) ?? null;

  const summary = useMemo(() => {
    if (!selectedPlan) {
      return {
        maxStudents: "-",
        pricePerStudent: "-",
        packageAmount: 0,
        discountAmount: 0,
        adminFees: "-",
        taxAmount: 0,
        amountAfterDiscount: 0,
        totalAmount: 0,
        installments: "-",
      };
    }
    const packageAmount =
      selectedPlan.maxStudents * selectedPlan.pricePerStudent;
    const discountPct = Number(form.discount) || 0;
    const discountAmount = (packageAmount * discountPct) / 100;
    const amountAfterDiscount = packageAmount - discountAmount;
    const taxPct = Number(form.tax) || 0;
    const taxAmount = (amountAfterDiscount * taxPct) / 100;
    const totalAmount =
      amountAfterDiscount + taxAmount + selectedPlan.administrativeFees;
    return {
      maxStudents: selectedPlan.maxStudents.toLocaleString(),
      pricePerStudent: `EGP ${selectedPlan.pricePerStudent}`,
      packageAmount,
      discountAmount,
      adminFees:
        selectedPlan.administrativeFees > 0
          ? `EGP ${selectedPlan.administrativeFees}`
          : "EGP 0",
      taxAmount,
      amountAfterDiscount,
      totalAmount,
      installments: selectedPlan.installments,
    };
  }, [selectedPlan, form.discount, form.tax]);

  const egp = (val: number) => `EGP ${val.toLocaleString("en-EG")}`;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!hasChanges) {
      showToast("warning", "No changes made.");
      return;
    }
    if (!form.instituteId || !form.planId) {
      showToast("error", "Please select an institute and a plan.");
      return;
    }
    // Simulate PATCH API call
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      setOriginalForm(form);
      showToast("success", "Contract updated successfully!");
      setTimeout(() => navigate("/dashboard/contracts"), 1500);
    }, 1200);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <Skeleton className="h-5 w-48" />
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text="Edit Contract" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-3"
        >
          <AlertCircle size={36} className="text-red-300" />
          <p className="text-sm font-medium text-red-400">
            Contract not found. Please go back and try again.
          </p>
          <Link
            to="/dashboard/institutions-contracts"
            className="text-sm text-blue-500 hover:underline"
          >
            Back to Contracts
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {toast && <Toast type={toast.type} message={toast.message} />}
      </AnimatePresence>

      <div className="flex flex-col gap-5 pb-8">
        <DashboardPageTitle text="Edit Annual Contract" showBack />

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
            to="/dashboard/institutions-contracts"
            className="hover:text-gray-600 transition-colors"
          >
            Contracts
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">Edit Contract #{contractId}</span>
        </motion.nav>

        {/* Unsaved changes banner */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium overflow-hidden"
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              You have unsaved changes
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* ── Left column ───────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Section 1 — Institute & Year */}
            <SectionCard
              number={1}
              title="Select Institute & Year"
              icon={<Building2 size={15} />}
              delay={0.1}
            >
              <Field label="Institute" required>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.instituteId}
                    onChange={(e) => set("instituteId", e.target.value)}
                  >
                    <option value="">Select Institute</option>
                    {DUMMY_INSTITUTES.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                  />
                </div>
              </Field>

              <Field label="Academic Year" required>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.academicYear}
                    onChange={(e) => set("academicYear", e.target.value)}
                  >
                    {ACADEMIC_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                  />
                </div>
              </Field>
            </SectionCard>

            {/* Section 2 — Plan */}
            <SectionCard
              number={2}
              title="Select Plan"
              icon={<FileText size={15} />}
              delay={0.18}
            >
              <Field label="Select Plan" required>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.planId}
                    onChange={(e) => set("planId", e.target.value)}
                  >
                    <option value="">Select plan</option>
                    {DUMMY_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                  />
                </div>
              </Field>

              <AnimatePresence>
                {!form.planId && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs text-gray-400 italic"
                  >
                    <Info size={12} />
                    Plan details will be loaded automatically.
                  </motion.p>
                )}
                {selectedPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex flex-col gap-1.5 p-3 rounded-lg bg-blue-50 border border-blue-100"
                  >
                    <p className="text-xs font-semibold text-blue-700 mb-1">
                      Plan Details
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-blue-600">
                      <span>
                        Max Students:{" "}
                        <strong>
                          {selectedPlan.maxStudents.toLocaleString()}
                        </strong>
                      </span>
                      <span>
                        Price/Student:{" "}
                        <strong>EGP {selectedPlan.pricePerStudent}</strong>
                      </span>
                      <span>
                        Installments:{" "}
                        <strong>{selectedPlan.installments}</strong>
                      </span>
                      <span>
                        Admin Fees:{" "}
                        <strong>EGP {selectedPlan.administrativeFees}</strong>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>
          </div>

          {/* ── Right column — Summary ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-5"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <Receipt size={16} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-800">
                Contract Summary
              </h3>
              <span className="text-xs text-gray-400 font-normal ms-1">
                (Auto-Calculated)
              </span>
            </div>

            <div className="px-5 py-4 flex flex-col">
              {/* Static rows */}
              {[
                { label: "Max Students", value: summary.maxStudents },
                {
                  label: "Price Per Student (EGP)",
                  value: summary.pricePerStudent,
                },
                {
                  label: "Package Amount",
                  value: selectedPlan ? egp(summary.packageAmount) : "-",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50"
                >
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm text-gray-700">{row.value}</span>
                </div>
              ))}

              {/* Discount — editable */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                <span className="text-sm text-gray-500">Discount (%)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => set("discount", e.target.value)}
                    className="w-16 h-7 px-2 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                    min={0}
                    max={100}
                  />
                  <span className="text-sm text-gray-700 w-24 text-right">
                    {selectedPlan ? egp(summary.discountAmount) : "EGP 0"}
                  </span>
                </div>
              </div>

              {/* Admin fees */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                <span className="text-sm text-gray-500">
                  Administrative Fees (EGP)
                </span>
                <span className="text-sm text-gray-700">
                  {summary.adminFees}
                </span>
              </div>

              {/* Tax — editable */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                <span className="text-sm text-gray-500">Tax (%)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.tax}
                    onChange={(e) => set("tax", e.target.value)}
                    className="w-16 h-7 px-2 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                    min={0}
                    max={100}
                  />
                  <span className="text-sm text-gray-700 w-24 text-right">
                    {selectedPlan ? egp(summary.taxAmount) : "EGP 0"}
                  </span>
                </div>
              </div>

              {/* Amount after discount */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                <span className="text-sm text-gray-500">
                  Amount After Discount
                </span>
                <span className="text-sm text-gray-700">
                  {selectedPlan ? egp(summary.amountAfterDiscount) : "EGP 0"}
                </span>
              </div>

              {/* Total — highlighted */}
              <div className="flex items-center justify-between py-3 mt-1 bg-blue-50 -mx-5 px-5 border-t border-blue-100">
                <span className="text-sm font-bold text-gray-900">
                  Total Amount (EGP)
                </span>
                <motion.span
                  key={summary.totalAmount}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-base font-bold text-blue-600"
                >
                  {egp(summary.totalAmount)}
                </motion.span>
              </div>

              <div className="mt-3 flex flex-col">
                <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Installments</span>
                  <span className="text-sm text-gray-700">
                    {selectedPlan ? String(summary.installments) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">Notes</span>
                  <span className="text-sm text-gray-700 max-w-[180px] text-right truncate">
                    {form.notes.trim() || "-"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex justify-end gap-3 pt-2"
        >
          <Link
            to="/dashboard/contracts"
            className="h-10 px-6 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X size={15} />
            Cancel
          </Link>
          <motion.button
            whileTap={{ scale: isPending || !hasChanges ? 1 : 0.97 }}
            onClick={handleSubmit}
            disabled={isPending || !hasChanges}
            className={`h-10 px-6 rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:cursor-not-allowed ${
              !hasChanges
                ? "bg-gray-300"
                : "bg-blue-500 hover:bg-blue-600 disabled:opacity-70"
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
        </motion.div>
      </div>
    </>
  );
};

export default EditAnnualContract;
