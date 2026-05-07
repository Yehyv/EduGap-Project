import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFormData {
  name: string;
  badge: string;
  minStudents: string;
  maxStudents: string;
  pricePerStudent: string;
  installments: string;
  status: boolean;
  description: string;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_PLANS: Record<string, PlanFormData> = {
  "1": {
    name: "Starter Plan",
    badge: "Basic",
    minStudents: "0",
    maxStudents: "500",
    pricePerStudent: "200",
    installments: "4",
    status: true,
    description:
      "Perfect for small institutions getting started with our platform. Includes core features and basic support.",
  },
  "2": {
    name: "Growth Plan",
    badge: "Popular",
    minStudents: "501",
    maxStudents: "2000",
    pricePerStudent: "180",
    installments: "4",
    status: true,
    description:
      "Ideal for growing institutions that need more capacity and advanced features with priority support.",
  },
  "3": {
    name: "Enterprise Plan",
    badge: "Enterprise",
    minStudents: "2001",
    maxStudents: "10000",
    pricePerStudent: "150",
    installments: "4",
    status: true,
    description:
      "Full-featured plan for large institutions with dedicated account management and custom integrations.",
  },
  "4": {
    name: "Custom Plan",
    badge: "Custom",
    minStudents: "10001",
    maxStudents: "",
    pricePerStudent: "",
    installments: "12",
    status: true,
    description:
      "Fully customized plan tailored to your institution's specific needs. Contact us for pricing.",
  },
};

const INSTALLMENT_OPTIONS = ["1", "2", "3", "4", "6", "12"];

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
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────

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

const inputClass =
  "w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors bg-white";

// ─── Main Component ───────────────────────────────────────────────────────────

const EditSubscriptionPlan = () => {
  const { id } = useParams<{ id: string }>();

  const defaultData: PlanFormData = DUMMY_PLANS[id ?? "1"] ?? {
    name: "",
    badge: "",
    minStudents: "0",
    maxStudents: "",
    pricePerStudent: "",
    installments: "",
    status: true,
    description: "",
  };

  const [form, setForm] = useState<PlanFormData>(defaultData);

  const set = (key: keyof PlanFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with API call
    console.log("Update plan:", id, form);
  };

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageTitle text="Edit Subscription Plan" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 -mt-3">
        <Link
          to="/dashboard/home"
          className="hover:text-gray-600 transition-colors"
        >
          Dashboard
        </Link>
        <span>›</span>
        <Link
          to="/dashboard/subscription-plans"
          className="hover:text-gray-600 transition-colors"
        >
          Subscription Plans
        </Link>
        <span>›</span>
        <span className="text-gray-600">Edit Plan</span>
      </nav>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Row 1 — Name + Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Plan Name" required>
              <input
                type="text"
                placeholder="Enter plan name"
                className={inputClass}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Plan Badge / Tag">
              <input
                type="text"
                placeholder="e.g. Popular, Basic, etc."
                className={inputClass}
                value={form.badge}
                onChange={(e) => set("badge", e.target.value)}
              />
            </Field>
          </div>

          {/* Row 2 — Min + Max + Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Min Students" required>
              <input
                type="number"
                placeholder="0"
                className={inputClass}
                value={form.minStudents}
                onChange={(e) => set("minStudents", e.target.value)}
                min={0}
              />
            </Field>
            <Field label="Max Students" required>
              <input
                type="number"
                placeholder="Enter max students"
                className={inputClass}
                value={form.maxStudents}
                onChange={(e) => set("maxStudents", e.target.value)}
                min={0}
              />
            </Field>
            <Field label="Price Per Student (EGP)" required>
              <input
                type="number"
                placeholder="Enter price per student"
                className={inputClass}
                value={form.pricePerStudent}
                onChange={(e) => set("pricePerStudent", e.target.value)}
                min={0}
              />
            </Field>
          </div>

          {/* Row 3 — Installments + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Field label="Default Installments" required>
              <select
                className={`${inputClass} cursor-pointer`}
                value={form.installments}
                onChange={(e) => set("installments", e.target.value)}
              >
                <option value="" disabled>
                  Select Installments
                </option>
                {INSTALLMENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <div className="flex items-center gap-3 h-10">
                <Toggle
                  checked={form.status}
                  onChange={(val) => set("status", val)}
                />
                <span className="text-sm text-gray-700 font-medium">
                  {form.status ? "Active" : "Inactive"}
                </span>
              </div>
            </Field>
          </div>

          {/* Row 4 — Description */}
          <Field label="Description">
            <textarea
              placeholder="Enter plan description..."
              rows={4}
              className={`${inputClass} h-auto py-2.5 resize-none`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Link
              to="/dashboard/subscription-plans"
              className="h-10 px-6 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="h-10 px-6 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubscriptionPlan;
