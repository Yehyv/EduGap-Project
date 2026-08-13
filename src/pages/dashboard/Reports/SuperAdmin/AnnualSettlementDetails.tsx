import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ArrowLeft,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MinusCircle,
  CreditCard,
  FileText,
  StickyNote,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { fetchAnnualSettlementDetail } from "@/features/Dashboard/services/dashboardApis";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val) =>
  `EGP ${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fmtDate = (iso) => iso?.split("T")[0] ?? iso;

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Status config ────────────────────────────────────────────────────────────

const useStatusConfig = () => {
  const { t } = useLanguage();

  const STATUS_CFG = {
    PAID: {
      class: "bg-green-50 text-green-600 border-green-200",
      dot: "bg-green-500",
      label: t("paid"),
      Icon: CheckCircle2,
    },
    FULLY_PAID: {
      class: "bg-green-50 text-green-600 border-green-200",
      dot: "bg-green-500",
      label: t("fullyPaid"),
      Icon: CheckCircle2,
    },
    PARTIAL: {
      class: "bg-blue-50 text-blue-500 border-blue-200",
      dot: "bg-blue-400",
      label: t("partiallyPaid"),
      Icon: Clock,
    },
    PARTIALLY_PAID: {
      class: "bg-blue-50 text-blue-500 border-blue-200",
      dot: "bg-blue-400",
      label: t("partiallyPaid"),
      Icon: Clock,
    },
    PENDING: {
      class: "bg-amber-50 text-amber-600 border-amber-200",
      dot: "bg-amber-400",
      label: t("pending"),
      Icon: Clock,
    },
    OVERDUE: {
      class: "bg-red-50 text-red-500 border-red-200",
      dot: "bg-red-500",
      label: t("overdue"),
      Icon: AlertCircle,
    },
    UPCOMING: {
      class: "bg-orange-50 text-orange-500 border-orange-200",
      dot: "bg-orange-400",
      label: t("upcoming"),
      Icon: Clock,
    },
    CLOSED: {
      class: "bg-gray-100 text-gray-500 border-gray-200",
      dot: "bg-gray-400",
      label: t("closed"),
      Icon: XCircle,
    },
    ACTIVE: {
      class: "bg-green-50 text-green-600 border-green-200",
      dot: "bg-green-500",
      label: t("active"),
      Icon: CheckCircle2,
    },
    CONFIRMED: {
      class: "bg-green-50 text-green-600 border-green-200",
      dot: "bg-green-500",
      label: t("confirmed"),
      Icon: CheckCircle2,
    },
  };

  const getStatusCfg = (s) =>
    STATUS_CFG[s] ?? {
      class: "bg-gray-100 text-gray-500 border-gray-200",
      dot: "bg-gray-400",
      label: s,
      Icon: MinusCircle,
    };

  return getStatusCfg;
};

const StatusBadge = ({ status }) => {
  const getStatusCfg = useStatusConfig();
  const cfg = getStatusCfg(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.class}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

// ─── Sub-panels ───────────────────────────────────────────────────────────────

const SettlementSummaryTab = ({ data }) => {
  const { t } = useLanguage();
  const { contract, contractSummary, collectionProgress } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Contract Information */}
      <motion.div
        {...fadeUp(0.05)}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          <FileText size={13} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">
            {t("contractInformation")}
          </h3>
        </div>
        <div className="px-5 py-4 flex flex-col gap-0">
          {[
            [t("plan"), data.planName],
            [t("maxStudents"), data.maxStudentsAllowed?.toLocaleString()],
            [t("pricePerStudent"), egp(contractSummary.pricePerStudent)],
            [t("installments"), data.paymentSummary?.totalInstallments],
            [t("startDate"), fmtDate(contract.contractStartDate)],
            [t("endDate"), fmtDate(contract.contractEndDate)],
          ].map(([label, value], i) => (
            <div
              key={label}
              className={`flex items-center justify-between py-2.5 ${i < 5 ? "border-b border-gray-50" : ""}`}
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Financial Summary */}
      <motion.div
        {...fadeUp(0.1)}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          <TrendingUp size={13} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">
            {t("financialSummary")}
          </h3>
        </div>
        <div className="px-5 py-4 flex flex-col gap-0">
          {[
            [t("packageAmount"), egp(contractSummary.packageAmount), false],
            [
              t("discount"),
              `${egp(contractSummary.discountAmount)} (${Math.round((contractSummary.discountAmount / contractSummary.packageAmount) * 100)}%)`,
              false,
            ],
            [
              t("administrativeFees"),
              egp(contractSummary.administrativeFees),
              false,
            ],
            [`${t("tax")} (14%)`, egp(contractSummary.taxAmount), false],
          ].map(([label, value], i) => (
            <div
              key={label}
              className={`flex items-center justify-between py-2.5 border-b border-gray-50`}
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-sm text-gray-700">{value}</p>
            </div>
          ))}
          <div className="flex items-center justify-between py-2.5">
            <p className="text-sm font-bold text-gray-800">
              {t("totalContractValue")}
            </p>
            <p className="text-sm font-bold text-gray-800">
              {egp(contractSummary.netAmount)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Collection Progress */}
      <motion.div
        {...fadeUp(0.15)}
        className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          <TrendingUp size={13} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">
            {t("collectionProgress")}
          </h3>
          <span className="ms-auto text-xs font-semibold text-gray-500">
            {collectionProgress.percentage}%
          </span>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(collectionProgress.percentage, 100)}%`,
              }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
              className="h-full bg-green-500 rounded-full"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">{t("collected")}</p>
              <p className="text-sm font-bold text-green-600">
                {egp(collectionProgress.collected)}
              </p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">{t("remaining")}</p>
              <p className="text-sm font-bold text-red-500">
                {egp(collectionProgress.remaining)}
              </p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">{t("progress")}</p>
              <p className="text-sm font-bold text-gray-700">
                {collectionProgress.percentage}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InstallmentsTab = ({ installments }) => {
  const { t } = useLanguage();
  return (
    <motion.div
      {...fadeUp(0.05)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {[
                "#",
                t("dueDate"),
                t("amount"),
                t("paid"),
                t("remaining"),
                t("status"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-start px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {installments.map((inst, i) => (
              <motion.tr
                key={inst.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                className="hover:bg-gray-50/60 transition-colors"
              >
                <td className="px-5 py-3.5 font-semibold text-gray-700">
                  {ordinal(inst.installmentNo)}
                </td>
                <td className="px-5 py-3.5 text-gray-600">
                  {fmtDate(inst.dueDate)}
                </td>
                <td className="px-5 py-3.5 font-medium text-gray-700">
                  {egp(inst.installmentAmount)}
                </td>
                <td className="px-5 py-3.5 font-medium text-green-600">
                  {egp(inst.paidAmount)}
                </td>
                <td className="px-5 py-3.5 font-medium text-red-400">
                  {egp(inst.remainingAmount)}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={inst.status} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const PaymentsTab = ({ payments }) => {
  const { t } = useLanguage();
  return (
    <motion.div
      {...fadeUp(0.05)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-2">
          <CreditCard size={28} className="text-gray-200" />
          <p className="text-sm text-gray-400">{t("noPaymentsRecordedYet")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {[
                  t("paymentId"),
                  t("date"),
                  t("amount"),
                  t("method"),
                  t("receiptNoDot"),
                  t("status"),
                ].map((h) => (
                  <th
                    key={h}
                    className="text-start px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                    #{p.paymentId}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {fmtDate(p.paymentDate)}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">
                    {egp(p.paidAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 capitalize">
                    {p.paymentMethod.replace("_", " ")}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                    {p.receiptNo || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

const PlaceholderTab = ({ icon: Icon, label }) => {
  const { t } = useLanguage();
  return (
    <motion.div
      {...fadeUp(0.05)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-2"
    >
      <Icon size={28} className="text-gray-200" />
      <p className="text-sm text-gray-400">
        {t("noXAvailable").replace("{label}", label.toLowerCase())}
      </p>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const AnnualSettlementDetailPage = () => {
  const { t } = useLanguage();
  const { contractId } = useParams();
  const [activeTab, setActiveTab] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["annual-settlement-detail", contractId],
    queryFn: () => fetchAnnualSettlementDetail(contractId),
    enabled: !!contractId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-8">
        <Sk className="h-5 w-72" />
        <Sk className="h-28" />
        <div className="grid grid-cols-4 gap-4">
          <Sk className="h-20" />
          <Sk className="h-20" />
          <Sk className="h-20" />
          <Sk className="h-20" />
        </div>
        <Sk className="h-64" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle size={36} className="text-red-300" />
        <p className="text-sm text-red-400">
          {t("failedToLoadSettlementDetails")}
        </p>
        <Link
          to="/dashboard/reports/settlements"
          className="text-sm text-blue-500 hover:underline"
        >
          {t("backToAnnualSettlement")}
        </Link>
      </div>
    );
  }

  const { contract, summary, installments, payments } = data;

  // Tab counts
  const tabLabels = [
    t("settlementSummary"),
    `${t("installments")} (${installments?.length ?? 0})`,
    `${t("payments")} (${payments?.length ?? 0})`,
    `${t("documents")} (0)`,
    t("notes"),
  ];

  return (
    <>
      <DashboardPageTitle text={t("institutionSettlementDetails")} />

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
          <Link
            to="/dashboard/reports"
            className="hover:text-gray-600 transition-colors"
          >
            {t("reports")}
          </Link>
          <ChevronRight size={13} />
          <Link
            to="/dashboard/reports/settlements"
            className="hover:text-gray-600 transition-colors"
          >
            {t("annualSettlement")}
          </Link>
          <ChevronRight size={13} />
          <span className="text-gray-600 font-medium">
            {t("settlementDetails")}
          </span>
        </motion.nav>

        {/* Back */}
        <motion.div {...fadeUp(0.03)}>
          <Link
            to="/dashboard/reports/settlements"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} />
            {t("back")}
          </Link>
        </motion.div>

        {/* Institute header card */}
        <motion.div
          {...fadeUp(0.06)}
          className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-gray-400" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-base font-bold text-gray-800">
                {contract.instituteName}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">
                  {t("contractNoColon")}
                </span>
                <span className="text-xs font-semibold text-gray-600 font-mono">
                  {contract.contractNo}
                </span>
                <StatusBadge status={contract.status} />
              </div>
            </div>
          </div>

          {/* Year badge */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white">
              <CalendarDays size={13} className="text-gray-400" />
              {contract.academicYear}
            </span>
          </div>
        </motion.div>

        {/* Summary KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: t("contractValue"),
              value: egp(summary.totalAmount),
              sub: null,
              color: "",
            },
            {
              label: t("totalCollected"),
              value: egp(summary.totalPaid),
              sub: `${summary.collectionPercentage}%`,
              color: "text-blue-500",
            },
            {
              label: t("remainingAmount"),
              value: egp(summary.remainingAmount),
              sub: null,
              color: "",
            },
            { label: t("status"), value: null, badge: data.settlementStatus },
          ].map(({ label, value, sub, color, badge }, i) => (
            <motion.div
              key={label}
              {...fadeUp(0.09 + i * 0.04)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-1"
            >
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              {badge ? (
                <div className="pt-1">
                  <StatusBadge status={badge} />
                </div>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-800 leading-tight">
                    {value}
                  </p>
                  {sub && (
                    <p className={`text-xs font-semibold ${color}`}>{sub}</p>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <motion.div {...fadeUp(0.22)} className="flex flex-col gap-0">
          {/* Tab bar */}
          <div className="flex items-end gap-0 border-b border-gray-200 overflow-x-auto">
            {tabLabels.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
                ${
                  activeTab === i
                    ? "text-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === i && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute bottom-0 start-0 right-0 h-0.5 bg-blue-500 rounded-t"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="pt-5">
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <SettlementSummaryTab key="summary" data={data} />
              )}
              {activeTab === 1 && (
                <InstallmentsTab
                  key="installments"
                  installments={installments ?? []}
                />
              )}
              {activeTab === 2 && (
                <PaymentsTab key="payments" payments={payments ?? []} />
              )}
              {activeTab === 3 && (
                <PlaceholderTab
                  key="docs"
                  icon={FileText}
                  label={t("documents")}
                />
              )}
              {activeTab === 4 && (
                <PlaceholderTab
                  key="notes"
                  icon={StickyNote}
                  label={t("notes")}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AnnualSettlementDetailPage;
