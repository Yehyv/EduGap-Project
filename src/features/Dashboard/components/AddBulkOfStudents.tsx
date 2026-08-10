import AddModal from "./AddModal";
import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { UploadIcon, XIcon, FileIcon } from "lucide-react";
import { dashboardApi } from "@/shared/services/dashboardApi";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { getAllProgramsForDropdown } from "../services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

/* ================== Validation ================== */
const bulkStudentSchema = Yup.object({
  excel_file: Yup.mixed()
    .required("Excel file is required")
    .test("fileFormat", "Only Excel files are allowed", (value) => {
      if (!value) return false;
      const file = value as File;
      return [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].includes(file.type);
    }),
  programId: Yup.string().required("Program is required"),
});

interface Props {
  reviewModalOpen: boolean;
  setReviewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddBulkOfStudents = ({ reviewModalOpen, setReviewModalOpen }: Props) => {
  const { t } = useLanguage();
  const { instituteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data } = useQuery({
    queryKey: ["getAllProgramsForDropdown", instituteId],
    queryFn: () => getAllProgramsForDropdown(instituteId ?? ""),
  });

  console.log(data);

  const handleProgramsData = data?.data.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const handleFileChange = (
    file: File | null,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    if (file) {
      setUploadedFile(file);
      setFieldValue("excel_file", file);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (
      file &&
      [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].includes(file.type)
    ) {
      handleFileChange(file, setFieldValue);
    } else {
      Swal.fire(t("error"), t("pleaseUploadValidExcelFile"), "error");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (setFieldValue: (field: string, value: any) => void) => {
    setUploadedFile(null);
    setFieldValue("excel_file", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", values.excel_file);
      formData.append("instituteId", String(instituteId));

      const response = await dashboardApi.post(
        `/users-batch-upload/upload?instituteId=${instituteId}&programId=${values?.programId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("studentsUploadedSuccessfully"),
      }).then(() => {
        const batchId = response.data.data.batchId;
        navigate(
          `/dashboard/institutes/${instituteId}/batch-results/${batchId}`,
        );
      });

      setReviewModalOpen(false);
      setUploadedFile(null);
      resetForm();

      queryClient.invalidateQueries({
        queryKey: ["getStudentsInInstitute"],
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setReviewModalOpen(false);

      Swal.fire({
        icon: "error",
        title: t("error"),
        text:
          err?.response?.data?.message || t("somethingWentWrongWhileUploading"),
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const initialValues = {
    excel_file: null,
    programId: "",
  };

  return (
    <AddModal
      maxW="max-w-2xl"
      open={reviewModalOpen}
      onOpenChange={(open) => {
        setReviewModalOpen(open);
        if (!open) {
          setUploadedFile(null);
        }
      }}
      headerComponent={
        <Dialog.Title className="text-secondary text-xl font-semibold">
          {t("addListOfStudents")}
        </Dialog.Title>
      }
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={bulkStudentSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, errors, touched }) => (
          <Form className="">
            <div className="flex flex-col gap-4 max-h-[80vh] overflow-auto px-2 -mt-4 py-2">
              <DropdownMenu
                label={t("program")}
                name="programId"
                options={handleProgramsData}
              />
              {!uploadedFile ? (
                // Upload Area
                <div
                  onDrop={(e) => handleDrop(e, setFieldValue)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging
                      ? "border-secondary bg-secondary/5"
                      : "border-[#ACACAC] bg-[#F9F8F8]"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                      <UploadIcon className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {t("dragAndDropExcelFileHere")}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">{t("or")}</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary-dark transition-colors"
                      >
                        {t("browseFiles")}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      {t("supportedFormats")}: .xls, .xlsx
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={(e) =>
                      handleFileChange(
                        e.target.files?.[0] || null,
                        setFieldValue,
                      )
                    }
                    className="hidden"
                  />
                </div>
              ) : (
                // File Preview
                <div className="border-2 border-secondary rounded-xl p-6 bg-secondary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <FileIcon className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(setFieldValue)}
                      className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                    >
                      <XIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              )}

              {errors.excel_file && touched.excel_file && (
                <p className="text-red-500 text-sm">
                  {errors.excel_file as string}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 justify-end">
              <button
                type="button"
                onClick={() => {
                  setReviewModalOpen(false);
                  setUploadedFile(null);
                }}
                className="border border-gray-300 text-gray-700 rounded-xl py-2 px-6 hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={isUploading || !uploadedFile}
                className="bg-secondary text-white rounded-xl py-2 px-6 hover:bg-secondary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? t("uploading") : t("continue")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </AddModal>
  );
};

export default AddBulkOfStudents;
