import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useState } from "react";
import StudentStatusModal from "@/features/Dashboard/components/StudentStatusModal";
import { useLanguage } from "@/shared/localization/useLanguage";

interface ActiveStatusButtonProps {
  isActive: boolean;
  itemId: string;
  itemName?: string;
  activateApi: (
    id: string,
    data: { note: string; reasonId: number },
  ) => Promise<any>;
  deactivateApi: (
    id: string,
    data: { note: string; reasonId: number },
  ) => Promise<any>;
  refetchKey: string | string[];
  className?: string;
  showModal?: boolean;
  withReasons?: boolean;
  onSuccess?: (isActivating: boolean) => void;
  onError?: (error: any, isActivating: boolean) => void;
}

const ActiveStatusButton = ({
  isActive,
  itemId,
  itemName,
  activateApi,
  deactivateApi,
  refetchKey,
  className = "",
  showModal = true,
  withReasons = false,
  onSuccess,
  onError,
}: ActiveStatusButtonProps) => {
  const { t } = useLanguage();
  const resolvedItemName = itemName ?? t("item");

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (Array.isArray(refetchKey)) {
      refetchKey?.map((r) => {
        console.log(r);

        queryClient.invalidateQueries({ queryKey: [r] });
      });
    } else {
      queryClient.invalidateQueries({ queryKey: [refetchKey] });
    }
  };

  /* ================= MUTATIONS ================= */
  const activateMutation = useMutation({
    mutationFn: (data: { note: string; reasonId: number }) =>
      activateApi(itemId, data),
    onSuccess: () => {
      invalidate();
      setStatusModalOpen(false);
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: `${resolvedItemName} ${t("activatedSuccessfully")}`,
        confirmButtonColor: "#10b981",
      });
      onSuccess?.(true);
    },
    onError: (error: any) => {
      setStatusModalOpen(false);
      Swal.fire({
        icon: "error",
        title: t("error"),
        text:
          error?.response?.data?.message ||
          error?.message ||
          `${t("failedToActivate")} ${resolvedItemName.toLowerCase()}`,
        confirmButtonColor: "#ef4444",
      });
      onError?.(error, true);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (data: { note: string; reasonId: number }) =>
      deactivateApi(itemId, data),
    onSuccess: () => {
      invalidate();
      setStatusModalOpen(false);
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: `${resolvedItemName} ${t("deactivatedSuccessfully")}`,
        confirmButtonColor: "#10b981",
      });
      onSuccess?.(false);
    },
    onError: (error: any) => {
      setStatusModalOpen(false);
      Swal.fire({
        icon: "error",
        title: t("error"),
        text:
          error?.response?.data?.message ||
          error?.message ||
          `${t("failedToDeactivate")} ${resolvedItemName.toLowerCase()}`,
        confirmButtonColor: "#ef4444",
      });
      onError?.(error, false);
    },
  });

  /* ================= HANDLERS ================= */
  const handleToggleStatus = () => {
    if (showModal) {
      setIsActivating(!isActive);
      setStatusModalOpen(true);
    } else {
      handleConfirmation();
    }
  };

  const handleConfirmation = () => {
    const action = isActive ? t("deactivate") : t("activate");
    Swal.fire({
      title: t("areYouSure"),
      text: `${t("doYouWantTo")} ${action} ${t("this")} ${resolvedItemName.toLowerCase()}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isActive ? "#ef4444" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `${t("yes")}, ${action}!`,
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.isConfirmed) {
        const fallback = { note: "", reasonId: 0 };
        if (isActive) {
          deactivateMutation.mutate(fallback);
        } else {
          activateMutation.mutate(fallback);
        }
      }
    });
  };

  // Receives { note, reasonId } directly from StudentStatusModal
  const handleStatusChange = (data: { note: string; reasonId: number }) => {
    if (isActivating) {
      activateMutation.mutate(data);
    } else {
      deactivateMutation.mutate(data);
    }
  };

  const isLoading = activateMutation.isPending || deactivateMutation.isPending;

  return (
    <>
      <button
        onClick={handleToggleStatus}
        disabled={isLoading}
        className={`px-6 py-1 text-nowrap rounded-full border font-medium text-sm relative transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive
            ? "border-green-500 text-green-500"
            : "border-red-500 text-red-500"
        } ${className}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {t("loading")}
          </span>
        ) : (
          <>
            {isActive ? t("active") : t("inactive")}
            <span
              className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </>
        )}
      </button>

      {showModal && (
        <StudentStatusModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          onSubmit={handleStatusChange}
          isLoading={isLoading}
          isActivating={isActivating}
          withReasons={withReasons}
        />
      )}
    </>
  );
};

export default ActiveStatusButton;
