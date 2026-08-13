import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  FileSpreadsheet,
  Download,
  Loader2,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { Link } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── API ─────────────────────────────────────────────────────────────────────

async function exportReport(params: ExportParams): Promise<Blob> {
  const res = await dashboardApi.get("/billing-reports/export", {
    params,
    responseType: "blob",
  });
  return res.data;
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ExportParams {
  reportType: string;
  format: string;
  academicYear: number;
  fromDate: string;
  toDate: string;
  planId?: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i);

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function FinancialReportsExportPage() {
  const { t } = useLanguage();

  const REPORT_TYPES = [
    {
      value: "COLLECTION_SUMMARY",
      label: t("reportTypeCollectionSummary"),
      description: t("reportTypeCollectionSummaryDesc"),
    },
    {
      value: "DISCOUNT_TAX",
      label: t("reportTypeDiscountTax"),
      description: t("reportTypeDiscountTaxDesc"),
    },
    {
      value: "ADMINISTRATIVE_FEES",
      label: t("reportTypeAdministrativeFees"),
      description: t("reportTypeAdministrativeFeesDesc"),
    },
    {
      value: "YEARLY_REVENUE",
      label: t("reportTypeYearlyRevenue"),
      description: t("reportTypeYearlyRevenueDesc"),
    },
    {
      value: "OVERDUE_INSTALLMENTS",
      label: t("reportTypeOverdueInstallments"),
      description: t("reportTypeOverdueInstallmentsDesc"),
    },
    {
      value: "UPCOMING_PAYMENTS",
      label: t("reportTypeUpcomingPayments"),
      description: t("reportTypeUpcomingPaymentsDesc"),
    },
    {
      value: "PAYMENT_PERCENTAGE",
      label: t("reportTypePaymentPercentage"),
      description: t("reportTypePaymentPercentageDesc"),
    },
  ];

  const [reportType, setReportType] = useState("COLLECTION_SUMMARY");
  const [format, setFormat] = useState<"EXCEL" | "PDF">("EXCEL");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [fromDate, setFromDate] = useState(`${CURRENT_YEAR}-01-01`);
  const [toDate, setToDate] = useState(`${CURRENT_YEAR}-12-31`);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const selectedReport = useMemo(
    () => REPORT_TYPES.find((r) => r.value === reportType)!,
    [reportType, t],
  );

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportReport({
        reportType,
        format,
        academicYear: year,
        fromDate,
        toDate,
      });
      const ext = format === "EXCEL" ? "xlsx" : "pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType.toLowerCase().replace(/_/g, "-")}-${year}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("success", t("exportSuccessToast"));
    } catch {
      showToast("error", t("exportErrorToast"));
    } finally {
      setExporting(false);
    }
  };

  const handleCancel = () => {
    setReportType("COLLECTION_SUMMARY");
    setFormat("EXCEL");
    setYear(CURRENT_YEAR);
    setFromDate(`${CURRENT_YEAR}-01-01`);
    setToDate(`${CURRENT_YEAR}-12-31`);
  };

  return (
    <>
      <DashboardPageTitle text={t("exportReportsPageTitle")} />
      <div>
        <div className="mx-auto space-y-5">
          {/* ── Breadcrumb ── */}
          <motion.nav
            {...fadeUp(0)}
            className="flex items-center gap-1.5 text-sm text-gray-400"
          >
            <Link
              to="/dashboard/home"
              className="hover:text-gray-600 transition-colors"
            >
              {t("dashboardBreadcrumb")}
            </Link>
            <ChevronRight size={13} />
            <span className="text-gray-600 font-medium">
              {t("reportsBreadcrumb")}
            </span>
            <ChevronRight size={13} />
            <span className="text-gray-600 font-medium">
              {t("exportReportsBreadcrumb")}
            </span>
          </motion.nav>

          {/* Info Banner */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3"
          >
            <Info size={16} className="text-blue-500 shrink-0" />
            <p className="text-sm text-blue-700 font-medium">
              {t("exportReportsInfoBanner")}
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Form Body */}
            <div className="p-6 space-y-6">
              {/* Row 1 — Report Type + Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Report Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("reportTypeLabel")}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full h-10 pl-3 pr-9 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition cursor-pointer"
                    >
                      {REPORT_TYPES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Format */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("formatLabel")} <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-3 h-10">
                    {/* Excel */}
                    <button
                      type="button"
                      onClick={() => setFormat("EXCEL")}
                      className={`flex items-center gap-2 px-4 h-10 rounded-lg border text-sm font-semibold transition-all ${
                        format === "EXCEL"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${format === "EXCEL" ? "border-blue-500" : "border-slate-300"}`}
                      >
                        {format === "EXCEL" && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </span>
                      <FileSpreadsheet
                        size={15}
                        className={
                          format === "EXCEL"
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }
                      />
                      {t("formatExcel")}
                    </button>

                    {/* PDF */}
                    {/* <button
                      type="button"
                      onClick={() => setFormat("PDF")}
                      className={`flex items-center gap-2 px-4 h-10 rounded-lg border text-sm font-semibold transition-all ${
                        format === "PDF"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${format === "PDF" ? "border-blue-500" : "border-slate-300"}`}
                      >
                        {format === "PDF" && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </span>
                      <FileText
                        size={15}
                        className={
                          format === "PDF" ? "text-red-500" : "text-slate-400"
                        }
                      />
                      {t("formatPdf")}
                    </button> */}
                  </div>
                </div>
              </div>

              {/* Row 2 — Year + From Date + To Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Year */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("yearLabel")} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={year}
                      onChange={(e) => {
                        const y = Number(e.target.value);
                        setYear(y);
                        setFromDate(`${y}-01-01`);
                        setToDate(`${y}-12-31`);
                      }}
                      className="w-full h-10 pl-3 pr-9 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition cursor-pointer"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* From Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("fromDateLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full h-10 pl-3 pr-9 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                  </div>
                </div>

                {/* To Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("toDateLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full h-10 pl-3 pr-9 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Report Preview */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={reportType}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="text-sm font-bold text-slate-700 mb-2">
                    {t("reportPreviewTitle")}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {selectedReport.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 bg-slate-50/60">
              <button
                onClick={handleCancel}
                className="h-10 px-5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                {t("cancelLabel")}
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="h-10 px-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {exporting ? t("exportingLabel") : t("exportReportButton")}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold z-50 ${
                toast.type === "success"
                  ? "bg-white border-emerald-200 text-emerald-700"
                  : "bg-white border-red-200 text-red-600"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <AlertCircle size={16} className="text-red-500" />
              )}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
