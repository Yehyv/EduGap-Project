import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import MyModal from "@/shared/components/ui/MyModal";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { fetchActivationReasons } from "../services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

interface StudentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { note: string; reasonId: number }) => void; // ← matches API exactly
  isLoading?: boolean;
  isActivating: boolean;
  withReasons?: boolean;
}

const StudentStatusModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  isActivating,
  withReasons = false,
}: StudentStatusModalProps) => {
  const { t } = useLanguage();
  const reasonType = isActivating ? "ACTIVE" : "INACTIVE";

  const { data: reasons = [], isLoading: isLoadingReasons } = useQuery({
    queryKey: ["activation-reasons", reasonType],
    queryFn: () => fetchActivationReasons(reasonType),
    enabled: isOpen && withReasons,
  });

  const validationSchema = withReasons
    ? Yup.object({
        reasonId: Yup.number()
          .required(t("reasonRequired"))
          .typeError(t("reasonRequired")),
        note: Yup.string()
          .optional()
          .test(
            "min-if-filled",
            t("notesMinLength"),
            (value) => !value || value.length >= 10,
          ),
      })
    : Yup.object({
        note: Yup.string()
          .required(t("notesRequired"))
          .min(10, t("notesMinLength")),
      });

  const formik = useFormik<{ reasonId: number | ""; note: string }>({
    initialValues: {
      reasonId: "",
      note: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // Send exactly what the API expects — no transformation needed
      onSubmit({
        note: values.note,
        reasonId: values.reasonId !== "" ? Number(values.reasonId) : 0,
      });
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
        title: t("activateUser"),
        bgColor: "bg-green-500",
        borderColor: "border-green-200",
        bgLight: "bg-green-50",
        textColor: "text-green-700",
        iconColor: "text-green-500",
        buttonBg: "bg-green-500",
        buttonHover: "hover:bg-green-600",
        buttonActive: "active:bg-green-700",
        focusRing: "focus:ring-green-200",
        selectFocus: "focus:ring-green-200 focus:border-green-400",
        message: t("activateUserMessage"),
        action: t("activate"),
        Icon: CheckCircle,
      }
    : {
        title: t("deactivateUser"),
        bgColor: "bg-red-500",
        borderColor: "border-red-200",
        bgLight: "bg-red-50",
        textColor: "text-red-700",
        iconColor: "text-red-500",
        buttonBg: "bg-red-500",
        buttonHover: "hover:bg-red-600",
        buttonActive: "active:bg-red-700",
        focusRing: "focus:ring-red-200",
        selectFocus: "focus:ring-red-200 focus:border-red-400",
        message: t("deactivateUserMessage"),
        action: t("deactivate"),
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
      <div
        className={`${config.bgLight} border ${config.borderColor} rounded-lg p-3 mb-4 flex items-start gap-2`}
      >
        <config.Icon
          className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`}
        />
        <p className={`text-sm ${config.textColor}`}>{config.message}</p>
      </div>

      <form onSubmit={formik.handleSubmit}>
        {/* Reason Dropdown — only when withReasons=true */}
        {withReasons && (
          <div className="mb-4">
            <label
              htmlFor="reasonId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("reason")} <span className="text-red-500">*</span>
            </label>
            <select
              id="reasonId"
              name="reasonId"
              value={formik.values.reasonId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading || isLoadingReasons}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${config.selectFocus} transition-all bg-white text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 ${
                formik.touched.reasonId && formik.errors.reasonId
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">
                {isLoadingReasons ? t("loadingReasons") : t("selectAReason")}
              </option>
              {reasons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reason}
                </option>
              ))}
            </select>
            {formik.touched.reasonId && formik.errors.reasonId && (
              <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3" />
                {formik.errors.reasonId}
              </p>
            )}
          </div>
        )}

        {/* Note Textarea */}
        <div className="mb-6">
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {withReasons
              ? t("additionalNotes")
              : `${t("reasonFor")} ${isActivating ? t("activation") : t("deactivation")}`}{" "}
            {withReasons ? (
              <span className="text-gray-400 text-xs font-normal">
                ({t("optional")})
              </span>
            ) : (
              <span className="text-red-500">*</span>
            )}
          </label>
          <textarea
            id="note"
            name="note"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${config.focusRing} transition-all resize-none ${
              formik.touched.note && formik.errors.note
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder={
              withReasons
                ? t("additionalNotesPlaceholder")
                : t("reasonPlaceholder")
            }
            value={formik.values.note}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isLoading}
          />
          <div className="flex items-start justify-between mt-1">
            <div className="flex-1">
              {formik.touched.note && formik.errors.note && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formik.errors.note}
                </p>
              )}
            </div>
            {(!withReasons || formik.values.note.length > 0) && (
              <span
                className={`text-xs ml-2 ${
                  formik.values.note.length >= 10
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {formik.values.note.length}/10
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={isLoading || !formik.dirty || !formik.isValid}
            className={`px-5 py-2.5 ${config.buttonBg} text-white font-medium rounded-lg ${config.buttonHover} ${config.buttonActive} transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("processing")}</span>
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
