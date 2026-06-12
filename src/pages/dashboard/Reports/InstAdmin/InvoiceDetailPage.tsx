import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import Logo from "@/assets/svgs/EduGapWithShadow.svg?react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceData {
  invoice: {
    invoiceNo: string;
    contractNo: string;
    contractId: number;
    installmentId: number;
    installmentNo: number;
    invoiceDate: string;
    dueDate: string;
    status: string;
    amount: number;
    paidAmount: number;
    remainingAmount: number;
  };
  billTo: {
    instituteId: number;
    instituteName: string;
  };
  items: {
    description: string;
    amount: number;
  }[];
  total: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchInvoice(invoiceId: string): Promise<InvoiceData> {
  const res = await dashboardApi.get(
    `/annual-settlements/institute/invoices/${invoiceId}`,
  );
  return res.data.data;
}

async function downloadInvoicePdf(invoiceId: string): Promise<void> {
  const res = await dashboardApi.get(
    `/annual-settlements/institute/invoices/${invoiceId}/download`,
    { responseType: "blob" },
  );
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const egp = (val: number) =>
  `${Number(val).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (iso: string) => iso?.split("T")[0] ?? iso;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  string,
  { cls: string; label: string; Icon: React.ElementType }
> = {
  PAID: {
    cls: "bg-green-50 text-green-600 border-green-200",
    label: "Paid",
    Icon: CheckCircle2,
  },
  PENDING: {
    cls: "bg-amber-50 text-amber-600 border-amber-200",
    label: "Pending",
    Icon: Clock,
  },
  OVERDUE: {
    cls: "bg-red-50 text-red-500 border-red-200",
    label: "Overdue",
    Icon: AlertCircle,
  },
  CANCELLED: {
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    label: "Cancelled",
    Icon: XCircle,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status] ?? {
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    label: status,
    Icon: Clock,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}
    >
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Sidebar Info Row ─────────────────────────────────────────────────────────

const SideRow = ({
  label,
  value,
  badge,
}: {
  label: string;
  value?: string;
  badge?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
      {label}
    </p>
    {badge ?? <p className="text-sm font-bold text-gray-800">{value}</p>}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const InvoiceDetailPage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => fetchInvoice(invoiceId!),
    enabled: !!invoiceId,
  });

  const handleDownloadPdf = async () => {
    if (!invoiceId) return;
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(invoiceId);
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <DashboardPageTitle text="Invoice Details" />
      <div className="flex flex-col gap-5 pb-8">
        {/* ── Breadcrumb ── */}
        <motion.nav
          {...fadeUp(0)}
          className="flex items-center gap-1.5 text-sm text-gray-400"
        >
          <Link
            to="/dashboard/home"
            className="hover:text-gray-600 transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight size={13} />
          <Link
            to="/dashboard/payments-history"
            className="hover:text-gray-600 transition-colors"
          >
            Payments History
          </Link>
          <ChevronRight size={13} />
          <span className="text-gray-600 font-medium">Invoice Details</span>
        </motion.nav>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            <Sk className="h-64" />
            <div className="lg:col-span-3">
              <Sk className="h-64" />
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {isError && !isLoading && (
          <motion.div
            {...fadeUp(0.05)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3"
          >
            <AlertCircle size={32} className="text-red-300" />
            <p className="text-sm text-red-400">
              Failed to load invoice. Please try again.
            </p>
            <Link
              to="/dashboard/billing/invoices"
              className="text-sm text-blue-500 hover:underline"
            >
              Back to Invoices
            </Link>
          </motion.div>
        )}

        {/* ── Content ── */}
        {!isLoading && !isError && data && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
            {/* ── Left sidebar ── */}
            <motion.div
              {...fadeUp(0.06)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                <BookOpen size={13} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-800">
                  Invoice Info
                </h3>
              </div>

              <div className="px-5 py-5 flex flex-col gap-4">
                <SideRow label="Invoice No." value={data.invoice.invoiceNo} />
                <div className="border-t border-gray-50" />
                <SideRow label="Contract No." value={data.invoice.contractNo} />
                <div className="border-t border-gray-50" />
                <SideRow
                  label="Invoice Date"
                  value={fmtDate(data.invoice.invoiceDate)}
                />
                <div className="border-t border-gray-50" />
                <SideRow
                  label="Due Date"
                  value={fmtDate(data.invoice.dueDate)}
                />
                <div className="border-t border-gray-50" />
                <SideRow
                  label="Status"
                  badge={<StatusBadge status={data.invoice.status} />}
                />
                <div className="border-t border-gray-50" />
                <SideRow
                  label="Amount"
                  value={`EGP ${egp(data.invoice.amount)}`}
                />
                <div className="border-t border-gray-50" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                    Description
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {data.items[0]?.description ?? "—"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── Right: invoice document ── */}
            <motion.div
              {...fadeUp(0.1)}
              className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Invoice document area */}
              <div className="px-8 py-8 flex flex-col gap-7">
                {/* ── Invoice header ── */}
                <div className="flex items-start justify-between">
                  {/* Logo + brand */}
                  <div className="flex items-center gap-2.5">
                    <Logo />
                  </div>

                  {/* INVOICE label */}
                  <h1 className="text-2xl font-extrabold text-gray-800 tracking-widest uppercase">
                    INVOICE
                  </h1>
                </div>

                {/* ── Meta row ── */}
                <div className="flex items-start justify-between gap-6">
                  {/* Bill To */}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-400 font-medium">Bill To</p>
                    <p className="text-sm font-bold text-gray-800">
                      {data.billTo.instituteName}
                    </p>
                  </div>

                  {/* Invoice details */}
                  <div className="flex flex-col gap-1.5 text-right">
                    {[
                      { label: "Invoice No.", value: data.invoice.invoiceNo },
                      {
                        label: "Invoice Date.",
                        value: fmtDate(data.invoice.invoiceDate),
                      },
                      {
                        label: "Due Date.",
                        value: fmtDate(data.invoice.dueDate),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center gap-6 justify-end"
                      >
                        <p className="text-xs text-gray-400 w-24 text-right">
                          {label}
                        </p>
                        <p className="text-xs font-semibold text-gray-700 w-24 text-right">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Divider ── */}
                <div className="border-t border-gray-100" />

                {/* ── Items table ── */}
                <div className="flex flex-col gap-0">
                  {/* Header */}
                  <div className="grid grid-cols-2 pb-2 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Description
                    </p>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide text-right">
                      Amount (EGP)
                    </p>
                  </div>

                  {/* Rows */}
                  {data.items.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-2 py-3.5 border-b border-gray-50"
                    >
                      <p className="text-sm text-gray-700">
                        {item.description}
                      </p>
                      <p className="text-sm text-gray-700 text-right">
                        {egp(item.amount)}
                      </p>
                    </div>
                  ))}

                  {/* Total row */}
                  <div className="grid grid-cols-2 pt-3.5">
                    <p className="text-sm font-bold text-gray-800">Total</p>
                    <p className="text-sm font-bold text-gray-800 text-right">
                      {egp(data.total)}
                    </p>
                  </div>
                </div>

                {/* ── Divider ── */}
                <div className="border-t border-gray-100" />

                {/* ── Thank you ── */}
                <p className="text-sm text-gray-400 text-center">
                  Thank you for your business!
                </p>
              </div>

              {/* ── Download actions ── */}
              <div className="flex items-center justify-center gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50/60">
                {/* Download PDF */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="h-10 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {isDownloading ? "Downloading…" : "Download PDF"}
                </button>

                {/* Download Excel — placeholder (no endpoint provided) */}
                <button
                  type="button"
                  className="h-10 px-6 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet size={14} className="text-green-500" />
                  Download Excel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default InvoiceDetailPage;
