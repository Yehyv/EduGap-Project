import { useQuery } from "@tanstack/react-query";
import ReportIcon from "@/assets/svgs/ReportIcon.svg?react";
import UserIcon from "@/assets/svgs/UserIcon.svg?react";
import SuccessIcon from "@/assets/svgs/SuccessIcon.svg?react";
import FailedIcon from "@/assets/svgs/FailedIcon.svg?react";
import {
  Calendar,
  Download,
  File,
  FilesIcon,
  MessageCircleWarning,
  Undo2,
  Upload,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { fetchBatchResult } from "@/features/Dashboard/services/dashboardApis";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import { toast } from "react-toastify";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RowData {
  email?: string;
  phone?: string;
  full_name?: string;
  national_id?: string;
  rowNumber?: number;
  [key: string]: unknown;
}

interface BatchError {
  id: number;
  rowNumber: number;
  fieldName: string | null;
  errorType: string;
  errorMessage: string;
  createdAt: string;
  rowData: RowData;
}

// ── Error type badge config ───────────────────────────────────────────────────
const errorTypeConfig: Record<string, { label: string; className: string }> = {
  INVALID_FORMAT: {
    label: "Invalid Format",
    className: "bg-orange-100 text-orange-700 border border-orange-200",
  },
  DUPLICATE_IN_DATABASE: {
    label: "Duplicate",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
  MISSING_FIELD: {
    label: "Missing Field",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  VALIDATION_ERROR: {
    label: "Validation",
    className: "bg-purple-100 text-purple-700 border border-purple-200",
  },
};

const getErrorBadge = (type: string) =>
  errorTypeConfig[type] ?? {
    label: type,
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  };

// ── Copy button ───────────────────────────────────────────────────────────────
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-1 p-0.5 rounded text-gray-400 hover:text-gray-700 transition-colors"
      title="Copy"
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
};

// ── Row Data Cell ─────────────────────────────────────────────────────────────
const RowDataCell = ({ rowData }: { rowData: RowData }) => {
  const fields: { key: keyof RowData; label: string }[] = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "national_id", label: "National ID" },
  ];

  return (
    <div className="flex flex-col gap-1 min-w-[200px]">
      {fields.map(({ key, label }) => {
        const val = rowData[key] as string | undefined;
        const isEmpty = !val || val === "";
        return (
          <div key={key} className="flex items-center gap-1 text-xs">
            <span className="text-gray-400 w-20 flex-shrink-0">{label}:</span>
            {isEmpty ? (
              <span className="italic text-red-400">empty</span>
            ) : (
              <span
                className="font-medium text-gray-700 truncate max-w-[140px]"
                title={val}
              >
                {val}
              </span>
            )}
            {!isEmpty && <CopyButton text={val!} />}
          </div>
        );
      })}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const BatchResultsSkeleton = () => (
  <div>
    <SkeletonBlock className="h-5 w-32 mb-2" />
    <SkeletonBlock className="h-4 w-full sm:w-80 mb-6" />
    <div className="bg-white rounded-xl p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <SkeletonBlock className="w-8 h-8 rounded-full" />
        <div className="space-y-2 w-full">
          <SkeletonBlock className="h-4 w-full sm:w-48" />
          <SkeletonBlock className="h-3 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2">
            <SkeletonBlock className="w-5 h-5 rounded-full" />
            <div className="space-y-2 w-full">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4">
          <div className="flex gap-4 items-center">
            <SkeletonBlock className="w-10 h-10 rounded-full" />
            <div className="space-y-2 w-full">
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Error Summary Banner ──────────────────────────────────────────────────────
const ErrorSummaryBanner = ({ errors }: { errors: BatchError[] }) => {
  const grouped = errors.reduce<Record<string, number>>((acc, e) => {
    acc[e.errorType] = (acc[e.errorType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 flex flex-wrap gap-3 items-center">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <span className="text-red-700 font-semibold text-sm">
        {errors.length} row{errors.length !== 1 ? "s" : ""} failed:
      </span>
      <div className="flex flex-wrap gap-2">
        {Object.entries(grouped).map(([type, count]) => {
          const badge = getErrorBadge(type);
          return (
            <span
              key={type}
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${badge.className}`}
            >
              {badge.label}: {count}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const BatchResults = () => {
  const { batchId, instituteId } = useParams();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadErrorReport = async () => {
    if (!batchId) return;
    setIsDownloading(true);
    try {
      const response = await dashboardApi.get(
        `/users-batch-upload/${batchId}/rejected-excel`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `error-report-batch-${batchId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download");
    } finally {
      setIsDownloading(false);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["batch-result", batchId],
    queryFn: () => fetchBatchResult(batchId ?? ""),
  });

  if (isLoading) return <BatchResultsSkeleton />;

  if (isError || !data) {
    return (
      <div className="bg-white p-6 rounded-xl text-red-500">
        Failed to load batch results
      </div>
    );
  }

  const {
    originalFileName,
    createdAt,
    createdBy,
    totalRows,
    insertedRows,
    ignoredRows,
    status,
    errors,
  } = data;

  const uploadStatusLabel =
    status === "FAILED" ? "Completed with errors" : "Completed successfully";

  return (
    <div>
      <h4>Batch Result</h4>
      <p className="text-gray-400 mb-4">
        Review the results of your bulk file upload
      </p>

      {/* Header card */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <ReportIcon className="w-8 shrink-0" />
          <div className="min-w-0">
            <div className="truncate font-medium">{originalFileName}</div>
            <div className="text-gray-400 text-sm">Upload Results</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex gap-2">
            <UserIcon className="w-5 h-5 mt-1 shrink-0" />
            <div>
              <div className="text-sm font-medium">Uploaded By</div>
              <div className="text-gray-400 text-sm break-words">
                {createdBy?.full_name}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Calendar className="w-5 h-5 mt-1 shrink-0" />
            <div>
              <div className="text-sm font-medium">Upload Date & Time</div>
              <div className="text-gray-400 text-sm">
                {new Date(createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <MessageCircleWarning className="w-5 h-5 text-yellow-500 mt-1 shrink-0" />
            <div>
              <div className="text-sm font-medium">Upload Status</div>
              <div className="inline-block text-[#D26200] text-sm bg-[#FFEBC7] px-2 rounded-2xl">
                {uploadStatusLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <StatCard
          icon={<FilesIcon className="w-10 h-10" />}
          label="Total Rows in File"
          value={totalRows}
        />
        <StatCard
          icon={<SuccessIcon />}
          label="Successfully Added"
          value={insertedRows}
          valueColor="text-green-600"
        />
        <StatCard
          icon={<FailedIcon />}
          label="Ignored / Failed Rows"
          value={ignoredRows}
          valueColor={ignoredRows > 0 ? "text-red-500" : undefined}
        />
      </div>

      {/* Error Summary Banner */}
      {errors?.length > 0 && <ErrorSummaryBanner errors={errors} />}

      {/* Error Table */}
      {errors?.length > 0 && (
        <div className="bg-white rounded-xl mt-4 overflow-hidden border border-gray-100 shadow-sm">
          {/* Table header */}
          <div
            className="px-4 py-3 border-b border-gray-200"
            style={{
              background:
                "linear-gradient(135deg, var(--color-secondary, #0a5c8a) 0%, #013856 100%)",
            }}
          >
            <h5 className="text-white font-semibold">Failed Records</h5>
            <p className="text-white/70 text-sm">
              {errors.length} row{errors.length !== 1 ? "s" : ""} could not be
              imported — fix and re-upload
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[780px] w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 w-16">Row #</th>
                  <th className="px-4 py-3 w-36">Error Type</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Row Data</th>
                </tr>
              </thead>
              <tbody>
                {errors
                  .slice()
                  .sort(
                    (a: BatchError, b: BatchError) => a.rowNumber - b.rowNumber,
                  )
                  .map((error: BatchError, i: number) => {
                    const badge = getErrorBadge(error.errorType);
                    const isDuplicate =
                      error.errorType === "DUPLICATE_IN_DATABASE";
                    return (
                      <tr
                        key={error.id}
                        className={`border-t border-gray-100 align-top transition-colors ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        } ${isDuplicate ? "hover:bg-red-50/60" : "hover:bg-orange-50/50"}`}
                      >
                        {/* Row number */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold text-xs">
                            {error.rowNumber}
                          </span>
                        </td>

                        {/* Error type badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* Message */}
                        <td className="px-4 py-3">
                          <p className="text-gray-800 text-sm leading-snug">
                            {error.errorMessage}
                          </p>
                          {error.fieldName && (
                            <p className="text-gray-400 text-xs mt-0.5">
                              Field:{" "}
                              <code className="bg-gray-100 px-1 rounded text-gray-600">
                                {error.fieldName}
                              </code>
                            </p>
                          )}
                        </td>

                        {/* Row data */}
                        <td className="px-4 py-3">
                          <RowDataCell rowData={error.rowData} />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 justify-end my-5">
        <Link
          to={`/dashboard/institutes/${instituteId}`}
          className="me-auto flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <Undo2 className="w-4 h-4" />
          <span>Back To Uploads</span>
        </Link>
        <button className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <File className="w-4 h-4 text-gray-400" />
          <span>View original file</span>
        </button>
        <button
          onClick={handleDownloadErrorReport}
          disabled={isDownloading}
          className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download
            className={`w-4 h-4 text-gray-400 ${isDownloading ? "animate-bounce" : ""}`}
          />
          <span>
            {isDownloading ? "Downloading…" : "Download error report (Excel)"}
          </span>
        </button>
        <button className="flex items-center gap-1.5 bg-secondary text-white rounded-lg px-3 py-1.5 text-sm hover:opacity-90 transition-opacity">
          <Upload className="w-4 h-4" />
          <span>Re-upload failed rows</span>
        </button>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  valueColor?: string;
}) => (
  <div className="bg-white rounded-xl p-4">
    <div className="flex gap-4 items-center">
      {icon}
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <strong className={`text-xl ${valueColor ?? "text-gray-800"}`}>
          {value}
        </strong>
      </div>
    </div>
  </div>
);

export default BatchResults;
