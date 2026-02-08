import { useFormik } from "formik";
import * as Yup from "yup";
import MyModal from "@/shared/components/ui/MyModal";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface StudentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
  isActivating: boolean;
}

const StudentStatusModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  isActivating,
}: StudentStatusModalProps) => {
  const formik = useFormik({
    initialValues: {
      reason: "",
    },
    validationSchema: Yup.object({
      reason: Yup.string()
        .required("Reason is required")
        .min(10, "Reason must be at least 10 characters"),
    }),
    onSubmit: (values) => {
      onSubmit(values.reason);
      formik.resetForm();
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      formik.resetForm();
      onClose();
    }
  };

  const config = isActivating
    ? {
        title: "Activate User",
        bgColor: "bg-green-500",
        borderColor: "border-green-200",
        bgLight: "bg-green-50",
        textColor: "text-green-700",
        iconColor: "text-green-500",
        buttonBg: "bg-green-500",
        buttonHover: "hover:bg-green-600",
        buttonActive: "active:bg-green-700",
        focusRing: "focus:ring-green-200",
        message:
          "This action will activate the User's account. They will be able to access the system.",
        action: "Activate",
        Icon: CheckCircle,
      }
    : {
        title: "Deactivate User",
        bgColor: "bg-red-500",
        borderColor: "border-red-200",
        bgLight: "bg-red-50",
        textColor: "text-red-700",
        iconColor: "text-red-500",
        buttonBg: "bg-red-500",
        buttonHover: "hover:bg-red-600",
        buttonActive: "active:bg-red-700",
        focusRing: "focus:ring-red-200",
        message:
          "This action will deactivate the User's account. They will not be able to access the system until reactivated.",
        action: "Deactivate",
        Icon: AlertTriangle,
      };

  return (
    <MyModal
      open={isOpen}
      onOpenChange={handleOpenChange}
      headerTitle={config.title}
      headerBgColor={config.bgColor}
      headerTextColor="text-white"
    >
      {/* Warning/Info Message */}
      <div
        className={`${config.bgLight} border ${config.borderColor} rounded-lg p-3 mb-4 flex items-start gap-2`}
      >
        <config.Icon
          className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`}
        />
        <p className={`text-sm ${config.textColor}`}>{config.message}</p>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Reason for {isActivating ? "Activation" : "Deactivation"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${config.focusRing} transition-all resize-none ${
              formik.touched.reason && formik.errors.reason
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Please provide a detailed reason (minimum 10 characters)..."
            value={formik.values.reason}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isLoading}
          />
          <div className="flex items-start justify-between mt-1">
            <div className="flex-1">
              {formik.touched.reason && formik.errors.reason && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formik.errors.reason}
                </p>
              )}
            </div>
            <span
              className={`text-xs ml-2 ${
                formik.values.reason.length >= 10
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {formik.values.reason.length}/10
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formik.dirty || !formik.isValid}
            className={`px-5 py-2.5 ${config.buttonBg} text-white font-medium rounded-lg ${config.buttonHover} ${config.buttonActive} transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              config.action
            )}
          </button>
        </div>
      </form>
    </MyModal>
  );
};

export default StudentStatusModal;
