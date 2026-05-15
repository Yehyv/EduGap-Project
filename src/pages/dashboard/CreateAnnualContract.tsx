import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Building2,
  FileText,
  Receipt,
  StickyNote,
  Info,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  BadgeAlert,
  RefreshCw,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  fetchCreateContractOptions,
  createContract,
  calculateContract,
} from "@/features/Dashboard/services/dashboardApis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InstituteOption {
  id: number;
  name: string;
  disabled: boolean;
  hasActiveContract: boolean;
  activeContract: null | { id: number; contractNo: string };
}

interface PlanOption {
  id: number;
  name: string;
  minStudents: number;
  maxStudents: number;
  defaultPricePerStudent: number;
  defaultInstallmentsCount: number;
  administrativeFees: number;
}

interface CreateContractOptionsResponse {
  academicYear: number;
  totals: {
    totalInstitutes: number;
    institutesWithActiveContract: number;
    availableInstitutes: number;
    activePlans: number;
  };
  institutes: InstituteOption[];
  plans: PlanOption[];
}

interface ContractCalculation {
  maxStudentsAllowed: number;
  pricePerStudent: number;
  packageAmount: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  amountAfterDiscount: number;
  administrativeFees: number;
  taxPercentage: number;
  taxBase: number;
  taxAmount: number;
  totalAmount: number;
}

type DiscountType = "PERCENTAGE" | "FIXED";

interface FormErrors {
  instituteId?: string;
  planId?: string;
  maxStudentsAllowed?: string;
  contractStartDate?: string;
  contractEndDate?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACADEMIC_YEARS = ["2024", "2025", "2026", "2027"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
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
          className="text-xs text-red-500 flex items-center gap-1"
        >
          <AlertCircle size={11} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const selectClass = (hasError?: boolean) =>
  `w-full h-10 px-3 rounded-lg border text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition-colors cursor-pointer appearance-none ${
    hasError
      ? "border-red-300 focus:ring-red-100 focus:border-red-400"
      : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
  }`;

const inputClass = (hasError?: boolean) =>
  `w-full h-10 px-3 rounded-lg border text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? "border-red-300 focus:ring-red-100 focus:border-red-400"
      : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
  }`;

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
      <span className="w-6 h-6 rounded-full bg-secondary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-5 flex flex-col gap-4">{children}</div>
  </motion.div>
);

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
    transition={{ duration: 0.25 }}
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

// ─── Summary Row ──────────────────────────────────────────────────────────────

const SummaryRow = ({
  label,
  value,
  bold,
  loading,
}: {
  label: string;
  value: string;
  bold?: boolean;
  loading?: boolean;
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span
      className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-500"}`}
    >
      {label}
    </span>
    {loading ? (
      <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
    ) : (
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm ${bold ? "font-bold text-secondary text-base" : "font-medium text-gray-800"}`}
      >
        {value}
      </motion.span>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CreateAnnualContract = () => {
  const navigate = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [academicYear, setAcademicYear] = useState("2025");
  const [instituteId, setInstituteId] = useState("");
  const [planId, setPlanId] = useState("");
  const [maxStudentsAllowed, setMaxStudentsAllowed] = useState("");
  const [pricePerStudent, setPricePerStudent] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("0");
  const [administrativeFees, setAdministrativeFees] = useState("0");
  const [taxPercentage, setTaxPercentage] = useState("14");
  const [installmentsCount, setInstallmentsCount] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ── Fetch dropdown options ─────────────────────────────────────────────────
  const { data: options, isLoading: optionsLoading } = useQuery({
    queryKey: ["create-contract-options", academicYear],
    queryFn: () => fetchCreateContractOptions(Number(academicYear)),
    enabled: !!academicYear,
  });

  const institutes: InstituteOption[] = options?.institutes ?? [];
  const plans: PlanOption[] = options?.plans ?? [];
  const totals = options?.totals;

  // ── Calculate mutation ─────────────────────────────────────────────────────
  const {
    mutate: calculate,
    data: calculation,
    isPending: isCalculating,
    reset: resetCalculation,
  } = useMutation({
    mutationFn: calculateContract,
  });

  // ── Auto-trigger calculate whenever relevant fields change ─────────────────
  const canCalculate =
    !!maxStudentsAllowed &&
    Number(maxStudentsAllowed) > 0 &&
    !!pricePerStudent &&
    Number(pricePerStudent) > 0;

  useEffect(() => {
    if (!canCalculate) {
      resetCalculation();
      return;
    }
    // Debounce 500ms so we don't fire on every keystroke
    const t = setTimeout(() => {
      calculate({
        maxStudentsAllowed: Number(maxStudentsAllowed),
        pricePerStudent: Number(pricePerStudent),
        discountType,
        discountValue: Number(discountValue) || 0,
        administrativeFees: Number(administrativeFees) || 0,
        taxPercentage: Number(taxPercentage) || 0,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [
    maxStudentsAllowed,
    pricePerStudent,
    discountType,
    discountValue,
    administrativeFees,
    taxPercentage,
    canCalculate,
  ]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleYearChange = (y: string) => {
    setAcademicYear(y);
    setInstituteId("");
    setPlanId("");
    setMaxStudentsAllowed("");
    setPricePerStudent("");
    setInstallmentsCount("");
    setAdministrativeFees("0");
    resetCalculation();
  };

  const handlePlanChange = (id: string) => {
    setPlanId(id);
    const plan = plans.find((p) => String(p.id) === id);
    if (plan) {
      // Always start at the plan's max as default, which is within range
      setMaxStudentsAllowed(String(plan.maxStudents));
      setPricePerStudent(String(plan.defaultPricePerStudent));
      setInstallmentsCount(String(plan.defaultInstallmentsCount));
      setAdministrativeFees(String(plan.administrativeFees));
    }
  };

  const selectedPlan = plans.find((p) => String(p.id) === planId) ?? null;
  const selectedInstitute =
    institutes.find((i) => String(i.id) === instituteId) ?? null;

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!instituteId) errs.instituteId = "Please select an institute";
    if (!planId) errs.planId = "Please select a plan";

    if (!maxStudentsAllowed || Number(maxStudentsAllowed) <= 0) {
      errs.maxStudentsAllowed = "Max students must be greater than 0";
    } else if (selectedPlan) {
      const val = Number(maxStudentsAllowed);
      if (val < selectedPlan.minStudents) {
        errs.maxStudentsAllowed = `Minimum allowed is ${selectedPlan.minStudents.toLocaleString()} students`;
      } else if (val > selectedPlan.maxStudents) {
        errs.maxStudentsAllowed = `Maximum allowed is ${selectedPlan.maxStudents.toLocaleString()} students`;
      }
    }

    if (!contractStartDate) errs.contractStartDate = "Start date is required";
    if (!contractEndDate) errs.contractEndDate = "End date is required";
    if (
      contractStartDate &&
      contractEndDate &&
      contractStartDate >= contractEndDate
    )
      errs.contractEndDate = "End date must be after start date";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Create mutation ────────────────────────────────────────────────────────
  const { mutate: submitCreate, isPending } = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      showToast("success", "Contract created successfully!");
      setTimeout(() => navigate("/dashboard/institutions-contracts"), 1500);
    },
    onError: () => {
      showToast("error", "Failed to create contract. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;
    submitCreate({
      instituteId: Number(instituteId),
      planId: Number(planId),
      academicYear: Number(academicYear),
      maxStudentsAllowed: Number(maxStudentsAllowed),
      pricePerStudent: Number(pricePerStudent),
      discountType,
      discountValue: Number(discountValue) || 0,
      administrativeFees: Number(administrativeFees) || 0,
      taxPercentage: Number(taxPercentage) || 0,
      installmentsCount: Number(installmentsCount),
      contractStartDate,
      contractEndDate,
      notes: notes.trim(),
    });
  };

  const calc = calculation;

  return (
    <>
      <AnimatePresence>
        {toast && <Toast type={toast.type} message={toast.message} />}
      </AnimatePresence>

      <div className="flex flex-col gap-5 pb-8">
        <DashboardPageTitle text="Create Annual Contract" showBack />

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
          <span className="text-gray-600">Create New Contract</span>
        </motion.nav>

        {/* Totals strip */}
        <AnimatePresence>
          {totals && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
              {[
                {
                  label: "Total Institutes",
                  value: totals.totalInstitutes,
                  color: "bg-blue-50 text-secondary",
                },
                {
                  label: "Available",
                  value: totals.availableInstitutes,
                  color: "bg-green-50 text-green-600",
                },
                {
                  label: "With Active Contract",
                  value: totals.institutesWithActiveContract,
                  color: "bg-amber-50 text-amber-600",
                },
                {
                  label: "Active Plans",
                  value: totals.activePlans,
                  color: "bg-violet-50 text-violet-600",
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border border-white ${s.color.split(" ")[0]}`}
                >
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <span
                    className={`text-xl font-bold ${s.color.split(" ")[1]}`}
                  >
                    {s.value}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Section 1 — Institute & Year */}
            <SectionCard
              number={1}
              title="Select Institute & Year"
              icon={<Building2 size={15} />}
              delay={0.1}
            >
              <Field label="Academic Year" required>
                <div className="relative">
                  <select
                    className={selectClass()}
                    value={academicYear}
                    onChange={(e) => handleYearChange(e.target.value)}
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

              <Field label="Institute" required error={errors.instituteId}>
                <div className="relative">
                  {optionsLoading ? (
                    <div className="h-10 flex items-center px-3 border border-gray-200 rounded-lg gap-2 text-sm text-gray-400">
                      <Loader2 size={14} className="animate-spin" />
                      Loading institutes...
                    </div>
                  ) : (
                    <select
                      className={selectClass(!!errors.instituteId)}
                      value={instituteId}
                      onChange={(e) => {
                        setInstituteId(e.target.value);
                        setErrors((p) => ({ ...p, instituteId: undefined }));
                      }}
                    >
                      <option value="">Select Institute</option>
                      {institutes.map((inst) => (
                        <option
                          key={inst.id}
                          value={inst.id}
                          disabled={inst.disabled || inst.hasActiveContract}
                        >
                          {inst.name}
                          {inst.hasActiveContract
                            ? " (Has Active Contract)"
                            : ""}
                        </option>
                      ))}
                    </select>
                  )}
                  <ChevronRight
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                  />
                </div>
              </Field>

              <AnimatePresence>
                {selectedInstitute?.hasActiveContract && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700"
                  >
                    <BadgeAlert size={14} className="flex-shrink-0" />
                    This institute already has an active contract for{" "}
                    {academicYear}.
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>

            {/* Section 2 — Plan */}
            <SectionCard
              number={2}
              title="Select Plan"
              icon={<FileText size={15} />}
              delay={0.18}
            >
              <Field label="Select Plan" required error={errors.planId}>
                <div className="relative">
                  {optionsLoading ? (
                    <div className="h-10 flex items-center px-3 border border-gray-200 rounded-lg gap-2 text-sm text-gray-400">
                      <Loader2 size={14} className="animate-spin" />
                      Loading plans...
                    </div>
                  ) : (
                    <select
                      className={selectClass(!!errors.planId)}
                      value={planId}
                      onChange={(e) => {
                        handlePlanChange(e.target.value);
                        setErrors((p) => ({ ...p, planId: undefined }));
                      }}
                    >
                      <option value="">Select plan</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.minStudents.toLocaleString()} –{" "}
                          {p.maxStudents.toLocaleString()} students)
                        </option>
                      ))}
                    </select>
                  )}
                  <ChevronRight
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                  />
                </div>
              </Field>

              <AnimatePresence>
                {!planId && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs text-gray-400 italic"
                  >
                    <Info size={12} />
                    Plan details will be auto-filled when you select a plan.
                  </motion.p>
                )}
                {selectedPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="p-3 rounded-lg bg-blue-50 border border-blue-100"
                  >
                    <p className="text-xs font-semibold text-blue-700 mb-2">
                      Plan Defaults (editable below)
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-secondary">
                      <span>
                        Range:{" "}
                        <strong>
                          {selectedPlan.minStudents.toLocaleString()} –{" "}
                          {selectedPlan.maxStudents.toLocaleString()}
                        </strong>
                      </span>
                      <span>
                        Price/Student:{" "}
                        <strong>
                          EGP {selectedPlan.defaultPricePerStudent}
                        </strong>
                      </span>
                      <span>
                        Installments:{" "}
                        <strong>{selectedPlan.defaultInstallmentsCount}</strong>
                      </span>
                      <span>
                        Admin Fees:{" "}
                        <strong>EGP {selectedPlan.administrativeFees}</strong>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Editable pricing fields — shown after plan selected */}
              <AnimatePresence>
                {planId && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3 pt-1 border-t border-gray-100"
                  >
                    <p className="text-xs font-semibold text-gray-600 pt-1">
                      Pricing (used for calculation)
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Max Students Allowed"
                        required
                        error={errors.maxStudentsAllowed}
                      >
                        <div className="relative">
                          <input
                            type="number"
                            className={inputClass(!!errors.maxStudentsAllowed)}
                            value={maxStudentsAllowed}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMaxStudentsAllowed(val);
                              setErrors((p) => ({
                                ...p,
                                maxStudentsAllowed: undefined,
                              }));
                            }}
                            onBlur={() => {
                              if (!selectedPlan || !maxStudentsAllowed) return;
                              const val = Number(maxStudentsAllowed);
                              if (val < selectedPlan.minStudents) {
                                setMaxStudentsAllowed(
                                  String(selectedPlan.minStudents),
                                );
                              } else if (val > selectedPlan.maxStudents) {
                                setMaxStudentsAllowed(
                                  String(selectedPlan.maxStudents),
                                );
                              }
                            }}
                            min={selectedPlan?.minStudents ?? 1}
                            max={selectedPlan?.maxStudents}
                            placeholder={
                              selectedPlan
                                ? `${selectedPlan.minStudents.toLocaleString()} – ${selectedPlan.maxStudents.toLocaleString()}`
                                : "Select a plan first"
                            }
                          />
                          {selectedPlan && (
                            <span className="absolute end-8 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                              max {selectedPlan.maxStudents.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {/* Range hint */}
                        {selectedPlan && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Info size={11} />
                            Allowed range:{" "}
                            <strong className="text-gray-600">
                              {selectedPlan.minStudents.toLocaleString()} –{" "}
                              {selectedPlan.maxStudents.toLocaleString()}
                            </strong>{" "}
                            students
                          </p>
                        )}
                      </Field>
                      <Field label="Price Per Student (EGP)">
                        <input
                          type="number"
                          className={inputClass()}
                          value={pricePerStudent}
                          onChange={(e) => setPricePerStudent(e.target.value)}
                          min={0}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Administrative Fees">
                        <input
                          type="number"
                          className={inputClass()}
                          value={administrativeFees}
                          onChange={(e) =>
                            setAdministrativeFees(e.target.value)
                          }
                          min={0}
                        />
                      </Field>
                      <Field label="Installments Count">
                        <input
                          type="number"
                          className={inputClass()}
                          value={installmentsCount}
                          onChange={(e) => setInstallmentsCount(e.target.value)}
                          min={1}
                          max={12}
                        />
                      </Field>
                    </div>

                    {/* Discount row */}
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Discount Type">
                        <div className="relative">
                          <select
                            className={selectClass()}
                            value={discountType}
                            onChange={(e) =>
                              setDiscountType(e.target.value as DiscountType)
                            }
                          >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount</option>
                          </select>
                          <ChevronRight
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                          />
                        </div>
                      </Field>
                      <Field
                        label={`Discount Value ${discountType === "PERCENTAGE" ? "(%)" : "(EGP)"}`}
                      >
                        <input
                          type="number"
                          className={inputClass()}
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          min={0}
                        />
                      </Field>
                    </div>

                    {/* Tax */}
                    <Field label="Tax Percentage (%)">
                      <input
                        type="number"
                        className={inputClass()}
                        value={taxPercentage}
                        onChange={(e) => setTaxPercentage(e.target.value)}
                        min={0}
                        max={100}
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>

            {/* Section 3 — Dates & Notes */}
            <SectionCard
              number={3}
              title="Contract Dates & Notes"
              icon={<CalendarDays size={15} />}
              delay={0.26}
            >
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Start Date"
                  required
                  error={errors.contractStartDate}
                >
                  <input
                    type="date"
                    className={inputClass(!!errors.contractStartDate)}
                    value={contractStartDate}
                    onChange={(e) => {
                      setContractStartDate(e.target.value);
                      setErrors((p) => ({
                        ...p,
                        contractStartDate: undefined,
                      }));
                    }}
                  />
                </Field>
                <Field label="End Date" required error={errors.contractEndDate}>
                  <input
                    type="date"
                    className={inputClass(!!errors.contractEndDate)}
                    value={contractEndDate}
                    onChange={(e) => {
                      setContractEndDate(e.target.value);
                      setErrors((p) => ({ ...p, contractEndDate: undefined }));
                    }}
                  />
                </Field>
              </div>
              <Field label="Notes">
                <textarea
                  rows={3}
                  placeholder="Add any notes about this contract..."
                  className={`${inputClass()} h-auto py-2.5 resize-none`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </SectionCard>
          </div>

          {/* ── Right column — Summary ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-5"
          >
            {/* Summary header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-800">
                  Contract Summary
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {isCalculating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-xs text-secondary"
                  >
                    <RefreshCw size={12} className="animate-spin" />
                    Calculating...
                  </motion.div>
                )}
                {!isCalculating && calc && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 text-xs text-green-600"
                  >
                    <CheckCircle2 size={12} />
                    Up to date
                  </motion.div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 flex flex-col">
              {!canCalculate ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300"
                >
                  <Receipt size={32} />
                  <p className="text-sm text-gray-400 text-center">
                    Select a plan and enter student count to see the summary
                  </p>
                </motion.div>
              ) : (
                <>
                  <SummaryRow
                    label="Max Students"
                    value={calc ? String(calc.maxStudentsAllowed) : "-"}
                    loading={isCalculating}
                  />
                  <SummaryRow
                    label="Price Per Student (EGP)"
                    value={calc ? egp(calc.pricePerStudent) : "-"}
                    loading={isCalculating}
                  />
                  <SummaryRow
                    label="Package Amount"
                    value={calc ? egp(calc.packageAmount) : "-"}
                    loading={isCalculating}
                  />
                  <SummaryRow
                    label={`Discount (${calc?.discountType === "PERCENTAGE" ? `${calc.discountValue}%` : `EGP ${calc?.discountValue ?? 0}`})`}
                    value={calc ? egp(calc.discountAmount) : "-"}
                    loading={isCalculating}
                  />
                  <SummaryRow
                    label="Amount After Discount"
                    value={calc ? egp(calc.amountAfterDiscount) : "-"}
                    loading={isCalculating}
                  />
                  <SummaryRow
                    label="Administrative Fees"
                    value={calc ? egp(calc.administrativeFees) : "-"}
                    loading={isCalculating}
                  />
                  <SummaryRow
                    label="Tax Base"
                    value={calc ? egp(calc.taxBase) : "-"}
                    loading={isCalculating}
                  />
                  <SummaryRow
                    label={`Tax (${taxPercentage}%)`}
                    value={calc ? egp(calc.taxAmount) : "-"}
                    loading={isCalculating}
                  />

                  {/* Total highlighted */}
                  <div className="flex items-center justify-between py-3 mt-1 bg-blue-50 -mx-5 px-5 border-t border-blue-100">
                    <span className="text-sm font-bold text-gray-900">
                      Total Amount (EGP)
                    </span>
                    {isCalculating ? (
                      <div className="h-5 w-28 bg-blue-100 animate-pulse rounded" />
                    ) : (
                      <motion.span
                        key={calc?.totalAmount}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-base font-bold text-secondary"
                      >
                        {calc ? egp(calc.totalAmount) : "EGP 0.00"}
                      </motion.span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col">
                    <SummaryRow
                      label="Installments"
                      value={installmentsCount || "-"}
                    />
                    <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Period</span>
                      <span className="text-sm font-medium text-gray-800">
                        {contractStartDate && contractEndDate
                          ? `${contractStartDate} → ${contractEndDate}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-gray-500">Notes</span>
                      <span className="text-sm text-gray-700 max-w-[180px] text-right truncate">
                        {notes.trim() || "-"}
                      </span>
                    </div>
                  </div>
                </>
              )}
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
            to="/dashboard/institutions-contracts"
            className="h-10 px-6 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X size={15} />
            Cancel
          </Link>
          <motion.button
            whileTap={{ scale: isPending ? 1 : 0.97 }}
            onClick={handleSubmit}
            disabled={isPending || !calc}
            className="h-10 px-6 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={15} />
                Create Contract
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default CreateAnnualContract;
