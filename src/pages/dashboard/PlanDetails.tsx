import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  TrendingUp,
  Users,
  DollarSign,
  Receipt,
  CalendarDays,
  Activity,
  AlignLeft,
  Building2,
  ChevronRight,
  AlertCircle,
  UserCircle,
  Hash,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  fetchPlanById,
  fetchPlanInstitutes,
  planActivateToggle,
} from "@/features/Dashboard/services/dashboardApis";
import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatedBy {
  id: number;
  full_name: string;
}

interface PlanDetails {
  id: number;
  plan_name: string;
  min_students: number;
  max_students: number;
  default_price_per_student: string;
  default_installments_count: number;
  description: string;
  administrative_fees: number;
  is_active: 0 | 1;
  institutesCount: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  createdBy: CreatedBy;
}

interface InstituteEntry {
  instituteId: number;
  instituteName: string;
  latestContractId: number;
  academicYear: number;
  contractStatus: string;
}

// ─── Badge helper ─────────────────────────────────────────────────────────────

const getBadge = (plan: PlanDetails) => {
  if (plan.max_students <= 100)
    return { label: "Basic", color: "bg-blue-100 text-blue-600" };
  if (plan.max_students <= 1000)
    return { label: "Popular", color: "bg-green-100 text-green-600" };
  if (plan.max_students <= 5000)
    return { label: "Enterprise", color: "bg-orange-100 text-orange-600" };
  return { label: "Custom", color: "bg-purple-100 text-purple-600" };
};

// ─── Contract status badge ────────────────────────────────────────────────────

const ContractStatusBadge = ({ status }: { status: string }) => {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
      {status}
    </span>
  );
};

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3, ease: "easeOut" }}
    className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
  >
    <span className="text-gray-400 flex-shrink-0">{icon}</span>
    <span className="text-sm text-gray-500 w-44 flex-shrink-0">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </motion.div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PlanDetailsPage = () => {
  const { planId } = useParams<{ planId: string }>();

  const {
    data: planData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subscription-plan", planId],
    queryFn: () => fetchPlanById(planId!),
    enabled: !!planId,
  });

  const { data: institutesData, isLoading: institutesLoading } = useQuery({
    queryKey: ["subscription-plan-institutes", planId],
    queryFn: () => fetchPlanInstitutes(planId!),
    enabled: !!planId,
  });

  const plan: PlanDetails | undefined = planData?.data;
  const institutes: InstituteEntry[] = institutesData?.data?.institutes ?? [];
  const badge = plan ? getBadge(plan) : null;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError || !plan) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text="Plan Details" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400"
        >
          <AlertCircle size={36} className="text-red-300" />
          <p className="text-sm font-medium text-red-400">
            Failed to load plan details. Please try again.
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
            <Pencil size={15} color="white" />
            <span className="me-2 text-white">Edit Plan</span>
          </Link>
        }
      />

      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
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
        <span className="text-gray-600">Plan Details</span>
      </motion.nav>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Plan Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={28} className="text-green-500" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">
                  {plan.plan_name}
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge?.color}`}
                >
                  {badge?.label}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Institutes Using This Plan
              </p>
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-gray-500" />
                <p className="text-sm font-semibold text-gray-700">
                  {plan.institutesCount} Institutes
                </p>
              </div>
            </div>
          </div>

          <ActiveStatusButton
            itemId={planId ?? ""}
            activateApi={() => planActivateToggle(planId ?? "")}
            deactivateApi={() => planActivateToggle(planId ?? "")}
            isActive={plan.is_active ?? false}
            refetchKey={"subscription-plan"}
            showModal={false}
          />
        </motion.div>

        {/* Body — two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Left — Details */}
          <div className="px-6 py-5 flex flex-col">
            <DetailRow
              icon={<Users size={16} />}
              label="Min Students"
              value={plan.min_students}
              delay={0.15}
            />
            <DetailRow
              icon={<Users size={16} />}
              label="Max Students"
              value={plan.max_students}
              delay={0.2}
            />
            <DetailRow
              icon={<DollarSign size={16} />}
              label="Price Per Student (EGP)"
              value={plan.default_price_per_student}
              delay={0.25}
            />
            <DetailRow
              icon={<Receipt size={16} />}
              label="Administrative Fees"
              value={plan.administrative_fees}
              delay={0.3}
            />
            <DetailRow
              icon={<CalendarDays size={16} />}
              label="Default Installments"
              value={plan.default_installments_count}
              delay={0.35}
            />
            <DetailRow
              icon={<Activity size={16} />}
              label="Status"
              value={plan.is_active ? "Active" : "Inactive"}
              delay={0.4}
            />

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="pt-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <AlignLeft size={16} className="text-gray-400" />
                <p className="text-sm text-gray-500">Description</p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed ps-6">
                {plan.description}
              </p>
            </motion.div>
          </div>

          {/* Right — Meta + Institutes */}
          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Plan Info cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            >
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Plan Info
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <UserCircle size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Created By</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {plan.createdBy.full_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Hash size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Plan ID</p>
                    <p className="text-sm font-semibold text-gray-800">
                      #{plan.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CalendarDays size={18} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Created At</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(plan.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <CalendarDays size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(plan.updated_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Institutes list */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.35 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Institutes Using This Plan
                </h3>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {institutes.length}
                </span>
              </div>

              {institutesLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : institutes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Building2 size={24} className="text-gray-300" />
                  <p className="text-sm text-gray-400">No institutes yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="flex flex-col gap-2">
                    {institutes.map((inst, index) => (
                      <motion.div
                        key={inst.instituteId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.45 + index * 0.06,
                          duration: 0.28,
                        }}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        {/* Left */}
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {inst.instituteName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <FileText
                                size={11}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <span className="text-[11px] text-gray-400">
                                Contract #{inst.latestContractId} ·{" "}
                                {inst.academicYear}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right */}
                        <ContractStatusBadge status={inst.contractStatus} />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanDetailsPage;
