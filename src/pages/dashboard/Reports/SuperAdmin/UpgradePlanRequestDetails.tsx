import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Building2,
  ArrowUpRight,
  Users,
  MessageSquare,
  Clock,
  XCircle,
  CheckCircle2,
  FileText,
  Calendar,
  Hash,
  Loader2,
  StickyNote,
} from "lucide-react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  fetchUpgradeRequestDetails,
  approveUpgradeRequest,
  rejectUpgradeRequest,
} from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpgradeRequest {
  id: number;
  instituteId: number;
  instituteName: string;
  currentContractId: number;
  currentPlanId: number;
  currentPlanName: string;
  requestedPlanId: number;
  requestedPlanName: string;
  reason: string;
  additionalStudentsNeeded: number;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-gray-800">{children}</div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UpgradePlanRequestDetails = () => {
  const { t } = useLanguage();

  // ─── Status config ──────────────────────────────────────────────────────
  const statusConfig: Record<
    string,
    { class: string; dot: string; label: string }
  > = {
    PENDING: {
      class: "bg-amber-50 text-amber-600 border-amber-200",
      dot: "bg-amber-400",
      label: t("contractPending"),
    },
    APPROVED: {
      class: "bg-green-50 text-green-600 border-green-200",
      dot: "bg-green-500",
      label: t("approved"),
    },
    REJECTED: {
      class: "bg-red-50 text-red-500 border-red-200",
      dot: "bg-red-400",
      label: t("rejected"),
    },
  };

  const getStatusCfg = (status: string) =>
    statusConfig[status] ?? {
      class: "bg-gray-100 text-gray-500 border-gray-200",
      dot: "bg-gray-400",
      label: status,
    };

  const { requestId: id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [reviewNotes, setReviewNotes] = useState("");
  const [notesError, setNotesError] = useState(false);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(
    null,
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["plan-upgrade-request", id],
    queryFn: () => fetchUpgradeRequestDetails(id as string),
    enabled: !!id,
  });

  const request: UpgradeRequest | undefined = data?.request;

  const mutation = useMutation({
    mutationFn: (status: "APPROVED" | "REJECTED") =>
      status === "APPROVED"
        ? approveUpgradeRequest(id as string, { reviewNotes })
        : rejectUpgradeRequest(id as string, { reviewNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan-upgrade-request", id] });
      setActionType(null);
      setReviewNotes("");
      setNotesError(false);
    },
  });

  const handleAction = (status: "APPROVED" | "REJECTED") => {
    // Review notes are required for rejection
    if (status === "REJECTED" && !reviewNotes.trim()) {
      setNotesError(true);
      return;
    }
    setNotesError(false);
    setActionType(status);
    mutation.mutate(status);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardPageTitle text={t("upgradeRequestDetails")} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-3"
        >
          <XCircle size={36} className="text-red-300" />
          <p className="text-sm font-medium text-red-400">
            {t("failedToLoadThisRequest")}
          </p>
          <Link
            to="/dashboard/upgrade-plan-requests"
            className="text-sm text-blue-500 hover:underline"
          >
            {t("backToRequests")}
          </Link>
        </motion.div>
      </div>
    );
  }

  const cfg = getStatusCfg(request.status);
  const isPending = request.status === "PENDING";

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageTitle text={t("upgradeRequestDetails")} />

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
          to="/dashboard/upgrade-plan-requests"
          className="hover:text-gray-600 transition-colors"
        >
          {t("planUpgradeRequests")}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-600">#{request.id}</span>
      </motion.nav>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-gray-100 shadow-sm bg-white p-5 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">
              {request.instituteName}
            </p>
            <p className="text-xs text-gray-400">
              {t("instituteId")} #{request.instituteId}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full border ${cfg.class}`}
        >
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Main details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="lg:col-span-2 rounded-xl border border-gray-100 shadow-sm bg-white p-6 flex flex-col gap-6"
        >
          {/* Plan change */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {t("planChange")}
            </p>
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-400 mb-1">{t("currentPlan")}</p>
                <p className="text-base font-bold text-gray-700">
                  {request.currentPlanName}
                </p>
                <p className="text-[11px] text-gray-400">
                  {t("planId")} #{request.currentPlanId}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <ArrowUpRight size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-400 mb-1">
                  {t("requestedPlan")}
                </p>
                <p className="text-base font-bold text-blue-600">
                  {request.requestedPlanName}
                </p>
                <p className="text-[11px] text-gray-400">
                  {t("planId")} #{request.requestedPlanId}
                </p>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {t("requestDetails")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailRow
                icon={<Hash size={16} />}
                label={t("currentContractId")}
              >
                #{request.currentContractId}
              </DetailRow>
              <DetailRow
                icon={<Users size={16} />}
                label={t("additionalStudentsNeeded")}
              >
                {request.additionalStudentsNeeded.toLocaleString()}
              </DetailRow>
              <DetailRow icon={<Calendar size={16} />} label={t("submittedOn")}>
                {fmtDate(request.createdAt)}
              </DetailRow>
              <DetailRow icon={<Calendar size={16} />} label={t("lastUpdated")}>
                {fmtDate(request.updatedAt)}
              </DetailRow>
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {t("reason")}
            </p>
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3.5">
              <FileText
                size={15}
                className="text-gray-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-gray-700">{request.reason}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {t("messageFromInstitute")}
            </p>
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3.5">
              <MessageSquare
                size={15}
                className="text-gray-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-gray-700">{request.message || "—"}</p>
            </div>
          </div>
        </motion.div>

        {/* Right — Review panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="rounded-xl border border-gray-100 shadow-sm bg-white p-6 flex flex-col gap-5 h-fit"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t("review")}
          </p>

          {!isPending ? (
            /* ── Already reviewed ── */
            <div className="flex flex-col gap-4">
              <DetailRow
                icon={
                  request.status === "APPROVED" ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )
                }
                label={t("reviewedBy")}
              >
                {request.reviewedBy ?? "—"}
              </DetailRow>
              <DetailRow icon={<Clock size={16} />} label={t("reviewedAt")}>
                {fmtDate(request.reviewedAt)}
              </DetailRow>
              {request.reviewNotes && (
                <DetailRow
                  icon={<StickyNote size={16} />}
                  label={t("reviewNotes")}
                >
                  <span className="font-normal text-gray-600">
                    {request.reviewNotes}
                  </span>
                </DetailRow>
              )}
            </div>
          ) : (
            /* ── Pending: show notes textarea + action buttons ── */
            <>
              {/* Review Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <StickyNote size={13} className="text-gray-400" />
                  {t("reviewNotes")}
                  <span className="text-red-400 font-bold">*</span>
                  <span className="text-gray-400 font-normal ml-0.5">
                    ({t("requiredForRejection")})
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => {
                    setReviewNotes(e.target.value);
                    if (notesError && e.target.value.trim())
                      setNotesError(false);
                  }}
                  placeholder={t("addReviewNotesHere")}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm text-gray-700 bg-white
                    focus:outline-none focus:ring-2 transition-colors resize-none
                    ${
                      notesError
                        ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                        : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
                    }`}
                />
                {notesError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle size={11} />
                    {t("reviewNotesRequiredWhenRejecting")}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <button
                  disabled={mutation.isPending}
                  onClick={() => handleAction("APPROVED")}
                  className="h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {mutation.isPending && actionType === "APPROVED" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  {t("approveRequest")}
                </button>

                <button
                  disabled={mutation.isPending}
                  onClick={() => handleAction("REJECTED")}
                  className="h-10 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {mutation.isPending && actionType === "REJECTED" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <XCircle size={15} />
                  )}
                  {t("rejectRequest")}
                </button>
              </div>

              {mutation.isError && (
                <p className="text-xs text-red-500 text-center">
                  {t("failedToSubmitReviewTryAgain")}
                </p>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UpgradePlanRequestDetails;
