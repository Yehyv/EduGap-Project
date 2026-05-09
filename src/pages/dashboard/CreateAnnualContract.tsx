import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  CalendarDays,
  FileText,
  Users,
  DollarSign,
  Percent,
  Receipt,
  StickyNote,
  Info,
  X,
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

const ACADEMIC_YEARS = ["2024", "2025", "2026", "2027"];

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

// ─── Summary Row ──────────────────────────────────────────────────────────────

const SummaryRow = ({
  label,
  value,
  bold,
  highlight,
  editable,
  editValue,
  onEdit,
  suffix,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  editable?: boolean;
  editValue?: string | number;
  onEdit?: (v: string) => void;
  suffix?: string;
}) => (
  <div
    className={`flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 ${
      highlight ? "bg-blue-50/50 -mx-5 px-5 rounded" : ""
    }`}
  >
    <span
      className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-500"}`}
    >
      {label}
    </span>
    <div className="flex items-center gap-2">
      {editable && onEdit ? (
        <input
          type="number"
          value={editValue ?? ""}
          onChange={(e) => onEdit(e.target.value)}
          className="w-20 h-7 px-2 text-sm text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
          min={0}
        />
      ) : null}
      <span
        className={`text-sm ${
          bold
            ? "font-bold text-blue-600 text-base"
            : highlight
              ? "font-semibold text-gray-800"
              : "text-gray-700"
        }`}
      >
        {value}
      </span>
      {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CreateAnnualContract = () => {
  const [instituteId, setInstituteId] = useState("");
  const [academicYear, setAcademicYear] = useState("2025");
  const [planId, setPlanId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("14");
  const [notes, setNotes] = useState("");

  const selectedPlan = DUMMY_PLANS.find((p) => String(p.id) === planId) ?? null;
  const selectedInstitute =
    DUMMY_INSTITUTES.find((i) => String(i.id) === instituteId) ?? null;

  // ── Auto-calculated values ─────────────────────────────────────────────────
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
    const discountPct = Number(discount) || 0;
    const discountAmount = (packageAmount * discountPct) / 100;
    const amountAfterDiscount = packageAmount - discountAmount;
    const taxPct = Number(tax) || 0;
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
  }, [selectedPlan, discount, tax]);

  const egp = (val: number) => `EGP ${val.toLocaleString("en-EG")}`;

  const handleNext = () => {
    console.log("Next step:", {
      instituteId,
      academicYear,
      planId,
      discount,
      tax,
      notes,
    });
  };

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Page Title */}
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

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Section 1 */}
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
                  value={instituteId}
                  onChange={(e) => setInstituteId(e.target.value)}
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
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
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

          {/* Section 2 */}
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
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
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
              {!planId && (
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
                      Installments: <strong>{selectedPlan.installments}</strong>
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

        {/* ── Right column — Summary ───────────────────────────────────────── */}
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
            <SummaryRow
              label="Max Students"
              value={summary.maxStudents}
              icon={<Users size={13} />}
            />
            <SummaryRow
              label="Price Per Student (EGP)"
              value={summary.pricePerStudent}
            />
            <SummaryRow
              label="Package Amount"
              value={selectedPlan ? egp(summary.packageAmount) : "-"}
            />

            {/* Discount — editable */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <span className="text-sm text-gray-500">Discount (%)</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-16 h-7 px-2 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                  min={0}
                  max={100}
                />
                <span className="text-sm text-gray-700 w-24 text-right">
                  {selectedPlan ? egp(summary.discountAmount) : "EGP 0"}
                </span>
              </div>
            </div>

            <SummaryRow
              label="Administrative Fees (EGP)"
              value={summary.adminFees}
            />

            {/* Tax — editable */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <span className="text-sm text-gray-500">Tax (%)</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className="w-16 h-7 px-2 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                  min={0}
                  max={100}
                />
                <span className="text-sm text-gray-700 w-24 text-right">
                  {selectedPlan ? egp(summary.taxAmount) : "EGP 0"}
                </span>
              </div>
            </div>

            <SummaryRow
              label="Amount After Discount"
              value={selectedPlan ? egp(summary.amountAfterDiscount) : "EGP 0"}
            />

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

            <div className="mt-3 flex flex-col gap-0">
              <SummaryRow
                label="Installments"
                value={selectedPlan ? String(summary.installments) : "-"}
              />
              <SummaryRow label="Notes" value={notes.trim() || "-"} />
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
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={!instituteId || !planId}
          className="h-10 px-6 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
          <ChevronRight size={15} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CreateAnnualContract;
