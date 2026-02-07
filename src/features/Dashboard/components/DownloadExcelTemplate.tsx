import Swal from "sweetalert2";
import { useState } from "react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import { FileSpreadsheet, Download } from "lucide-react";

const DownloadExcelTemplate = ({ excelContent }: { excelContent?: string }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await dashboardApi.get("/users-batch-upload/template", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${excelContent || "students"}_template.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Template downloaded successfully",
        confirmButtonColor: "#0d6efd",
        timer: 2000,
      });
    } catch (error: any) {
      console.error("Download error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to download template",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4 py-2 min-w-60 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
    >
      {/* Excel Icon with Download Badge */}
      <div className="relative">
        <FileSpreadsheet className="w-5 h-5" />
        {!isDownloading && (
          <Download className="w-3 h-3 absolute -bottom-1 -right-1 bg-white text-green-600 rounded-full p-0.5" />
        )}
      </div>

      {/* Button Text */}
      <span className="font-medium text-sm">
        {isDownloading
          ? "Downloading..."
          : `Download ${excelContent ?? ""} Excel Template`}
      </span>

      {/* Loading Spinner */}
      {isDownloading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
};

export default DownloadExcelTemplate;
