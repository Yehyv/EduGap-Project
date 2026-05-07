import { Link, useParams } from "react-router-dom";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Institute {
  id: number;
  name: string;
}

interface PlanDetails {
  id: number;
  name: string;
  badge: string;
  badgeColor: string;
  status: "Active" | "Inactive";
  minStudents: number;
  maxStudents: number | string;
  pricePerStudent: number | string;
  installments: number | string;
  description: string;
  institutes: Institute[];
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_PLANS: Record<string, PlanDetails> = {
  "1": {
    id: 1,
    name: "Starter Plan",
    badge: "Basic",
    badgeColor: "bg-blue-100 text-blue-600",
    status: "Active",
    minStudents: 0,
    maxStudents: 500,
    pricePerStudent: "200.00",
    installments: 4,
    description:
      "Perfect for small institutions getting started with our platform. Includes core features and basic support.",
    institutes: [
      { id: 1, name: "Cairo Digital Academy" },
      { id: 2, name: "Delta Tech Institute" },
      { id: 3, name: "Nile Learning Center" },
    ],
  },
  "2": {
    id: 2,
    name: "Growth Plan",
    badge: "Popular",
    badgeColor: "bg-green-100 text-green-600",
    status: "Active",
    minStudents: 501,
    maxStudents: 2000,
    pricePerStudent: "180.00",
    installments: 4,
    description: "Growth plan for institutes with 501 to 2000 students.",
    institutes: [
      { id: 1, name: "Almarefa Institute" },
      { id: 2, name: "Attamia Institute" },
      { id: 3, name: "Future Academy" },
      { id: 4, name: "Smart Learning Institute" },
      { id: 5, name: "Knowledge House" },
      { id: 6, name: "Success Academy" },
    ],
  },
  "3": {
    id: 3,
    name: "Enterprise Plan",
    badge: "Enterprise",
    badgeColor: "bg-orange-100 text-orange-600",
    status: "Active",
    minStudents: 2001,
    maxStudents: 10000,
    pricePerStudent: "150.00",
    installments: 4,
    description:
      "Full-featured plan for large institutions with dedicated account management and custom integrations.",
    institutes: [
      { id: 1, name: "Heliopolis University" },
      { id: 2, name: "Alexandria Institute" },
    ],
  },
  "4": {
    id: 4,
    name: "Custom Plan",
    badge: "Custom",
    badgeColor: "bg-purple-100 text-purple-600",
    status: "Active",
    minStudents: 10001,
    maxStudents: "Unlimited",
    pricePerStudent: "Custom",
    installments: "Custom",
    description:
      "Fully customized plan tailored to your institution's specific needs. Contact us for pricing.",
    institutes: [{ id: 1, name: "National Education Corp" }],
  },
};

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-500 w-44 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PlanDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const plan = DUMMY_PLANS[id ?? "2"] ?? DUMMY_PLANS["2"];

  const visibleInstitutes = plan.institutes.slice(0, 6);
  const hasMore = plan.institutes.length > 6;

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageTitle
        text="Plan Details"
        button
        buttonText={
          <Link
            to={`/dashboard/subscription-plans/edit/${plan.id}`}
            className="flex items-center gap-2 p-1.5"
          >
            <EditIcon />
            <span className="me-2 text-white">Edit Plan</span>
          </Link>
        }
      />

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
        <span className="text-gray-600">Plan Details</span>
      </nav>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Plan Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <polyline
                  points="22 7 13.5 15.5 8.5 10.5 2 17"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="16 7 22 7 22 13"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Name + meta */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${plan.badgeColor}`}
                >
                  {plan.badge}
                </span>
              </div>
              <p className="text-sm text-gray-400">Institute Using This Plan</p>
              <p className="text-sm font-semibold text-gray-700">
                {plan.institutes.length} Institutes
              </p>
            </div>
          </div>

          {/* Status */}
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${
              plan.status === "Active"
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                plan.status === "Active" ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {plan.status}
          </span>
        </div>

        {/* Body — two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Left — Details */}
          <div className="px-6 py-5 flex flex-col">
            <DetailRow label="Min Students" value={plan.minStudents} />
            <DetailRow label="Max Students" value={plan.maxStudents} />
            <DetailRow
              label="Price Per Student (EGP)"
              value={plan.pricePerStudent}
            />
            <DetailRow label="Default Installments" value={plan.installments} />
            <DetailRow label="Status" value={plan.status} />
            <div className="pt-2.5">
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {plan.description}
              </p>
            </div>
          </div>

          {/* Right — Institutes */}
          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Institutes Using This Plan
            </h3>
            <div className="flex flex-col gap-2">
              {visibleInstitutes.map((inst, index) => (
                <div key={inst.id} className="flex items-center gap-3 py-1.5">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{inst.name}</span>
                </div>
              ))}
            </div>

            {hasMore && (
              <Link
                to={`/dashboard/subscription-plans/${plan.id}/institutes`}
                className="inline-block mt-4 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
              >
                View All
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
