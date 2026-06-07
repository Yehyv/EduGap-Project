import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useState } from "react";
import StudentStatusModal from "@/features/Dashboard/components/StudentStatusModal";

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
  itemName = "Item",
  activateApi,
  deactivateApi,
  refetchKey,
  className = "",
  showModal = true,
  withReasons = false,
  onSuccess,
  onError,
}: ActiveStatusButtonProps) => {
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
        title: "Success!",
        text: `${itemName} activated successfully`,
        confirmButtonColor: "#10b981",
      });
      onSuccess?.(true);
    },
    onError: (error: any) => {
      setStatusModalOpen(false);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          `Failed to activate ${itemName.toLowerCase()}`,
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
        title: "Success!",
        text: `${itemName} deactivated successfully`,
        confirmButtonColor: "#10b981",
      });
      onSuccess?.(false);
    },
    onError: (error: any) => {
      setStatusModalOpen(false);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          `Failed to deactivate ${itemName.toLowerCase()}`,
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
    const action = isActive ? "deactivate" : "activate";
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${action} this ${itemName.toLowerCase()}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isActive ? "#ef4444" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: "Cancel",
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
            Loading...
          </span>
        ) : (
          <>
            {isActive ? "Active" : "Inactive"}
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
