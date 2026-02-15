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
} from "lucide-react";
import { fetchBatchResult } from "@/features/Dashboard/services/dashboardApis";
import { Link, useParams } from "react-router-dom";

/* ---------------- Skeleton ---------------- */

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const BatchResultsSkeleton = () => (
  <div>
    <SkeletonBlock className="h-5 w-32 mb-2" />
    <SkeletonBlock className="h-4 w-full sm:w-80 mb-6" />

    {/* Header */}
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

    {/* Stats */}
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

    {/* Table */}
    <div className="bg-white rounded-xl mt-6">
      <div className="px-4 py-3 border-b border-gray-400">
        <SkeletonBlock className="h-4 w-32 mb-2" />
        <SkeletonBlock className="h-3 w-full sm:w-64" />
      </div>

      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            <SkeletonBlock className="h-4" />
            <SkeletonBlock className="h-4" />
            <SkeletonBlock className="h-4" />
            <SkeletonBlock className="h-4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ---------------- Component ---------------- */

const BatchResults = () => {
  const { batchId, instituteId } = useParams();

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

      {/* Header */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <ReportIcon className="w-8 shrink-0" />
          <div className="min-w-0">
            <div className="truncate">{originalFileName}</div>
            <div className="text-gray-400 text-sm">Upload Results</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex gap-2">
            <UserIcon className="w-5 h-5 mt-1 shrink-0" />
            <div>
              <div>Uploaded By</div>
              <div className="text-gray-400 text-sm break-words">
                {createdBy?.full_name}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Calendar className="w-5 h-5 mt-1 shrink-0" />
            <div>
              <div>Upload Date & Time</div>
              <div className="text-gray-400 text-sm">
                {new Date(createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <MessageCircleWarning className="w-5 h-5 text-yellow-500 mt-1 shrink-0" />
            <div>
              <div>Upload Status</div>
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
        />
        <StatCard
          icon={<FailedIcon />}
          label="Ignored / Failed Rows"
          value={ignoredRows}
        />
      </div>

      {/* Table */}
      {errors?.length > 0 && (
        <div className="bg-white rounded-xl mt-4 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-400">
            <h5>Failed Records</h5>
            <p className="text-gray-400 text-sm">
              Review the errors below to fix and re-upload
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Row</th>
                  <th className="px-4 py-3 text-left">Identifier</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((error: any) => (
                  <tr
                    key={error.id}
                    className="border-t border-gray-300 hover:bg-red-50"
                  >
                    <td className="px-4 py-3">{error.rowNumber}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {error.fieldName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                        {error.errorType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-red-600 break-words">
                      {error.errorMessage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end my-5 max-md:flex-col">
        <Link to={`/dashboard/institutes/${instituteId}`} className="me-auto">
          <Undo2 className="inline-block me-2" />
          <span>Back To Uploads</span>
        </Link>
        <button className="border border-gray-400 rounded-lg px-2 py-1">
          <File className="inline-block me-2 text-gray-400" />
          <span>View original file</span>
        </button>
        <button className="border border-gray-400 rounded-lg px-2 py-1">
          <Download className="inline-block me-2 text-gray-400" />
          <span>Download erorr report (excel)</span>
        </button>
        <button className="bg-secondary text-white rounded-lg px-2 py-1">
          <Upload className="inline-block me-2 text-white" />
          <span>Re-upload Failed rows only</span>
        </button>
      </div>
    </div>
  );
};

/* ---------------- Small Reusable Card ---------------- */

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div className="bg-white rounded-xl p-4">
    <div className="flex gap-4 items-center">
      {icon}
      <div>
        <div className="text-sm">{label}</div>
        <strong className="text-xl">{value}</strong>
      </div>
    </div>
  </div>
);

export default BatchResults;
