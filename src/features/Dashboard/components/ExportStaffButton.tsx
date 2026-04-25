import Swal from "sweetalert2";
import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { dashboardApi } from "@/shared/services/dashboardApi";
import { useLanguage } from "@/shared/localization/useLanguage";

const ExportStaffButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { instituteId } = useParams();
  const [searchParams] = useSearchParams();

  const programId = searchParams.get("programId") || "";
  const isActive = searchParams.get("isActive") || "";

  const { lang } = useLanguage();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (programId) params.append("programId", programId);
      if (isActive) params.append("isActive", isActive);

      const queryString = params.toString();
      const url = `/users/stuff/export${queryString ? `?${queryString}` : ""}`;

      const response = await dashboardApi.get(url, {
        responseType: "blob",
        headers: {
          languageId: lang === "ar" ? "1" : "2", // ← language header
        },
        params: {
          instituteId: instituteId ? +instituteId : 0,
        },
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;

      const currentDate = new Date().toISOString().split("T")[0];
      let filename = `staff_export_${currentDate}`;
      if (programId) filename += `_program${programId}`;
      if (isActive) filename += `_${isActive === "1" ? "active" : "inactive"}`;
      link.download = `${filename}.xlsx`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Staff data exported successfully",
        confirmButtonColor: "#0d6efd",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Export error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message || "Failed to export students data",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsExporting(false);
    }
  };
  const hasActiveFilters = programId || isActive;

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
      title={
        hasActiveFilters
          ? `Export with filters: ${programId ? `Program ${programId}` : ""}${programId && isActive ? ", " : ""}${isActive ? (isActive === "1" ? "Active" : "Inactive") : ""}`
          : "Export all students"
      }
    >
      {/* Excel Icon */}
      <div className="relative">
        <FileSpreadsheet className="w-5 h-5" />
        {!isExporting && (
          <Download className="w-3 h-3 absolute -bottom-1 -right-1 bg-white text-green-600 rounded-full p-0.5" />
        )}
        {/* Active Filters Badge */}
        {hasActiveFilters && !isExporting && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white" />
        )}
      </div>

      {/* Button Text */}
      <span className="font-medium text-sm">
        {isExporting ? "Exporting..." : "Export to Excel"}
      </span>

      {/* Loading Spinner */}
      {isExporting && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
};

export default ExportStaffButton;
