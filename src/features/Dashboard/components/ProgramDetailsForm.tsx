import { TextField } from "@/shared/components";
import ButtonLoader from "@/shared/components/ButtonLoader";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import { useLanguage } from "@/shared/localization/useLanguage";
import { Form, Formik } from "formik";
import Swal from "sweetalert2";

const EditProgramDetailsForm = ({
  programSchema,
  addProgramMutation,
  initialValues,
  isLoading,
}) => {
  const { t } = useLanguage();
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={programSchema}
      onSubmit={(values, { resetForm }) => {
        if (JSON.stringify(initialValues) === JSON.stringify(values)) {
          Swal.fire({
            icon: "warning",
            title: t("warning"),
            text: t("nothing_change"),
            confirmButtonText: "OK",
          });
          return;
        }
        addProgramMutation.mutate(values, {
          onSuccess: () => {
            resetForm();
          },
        });
      }}
    >
      <Form>
        {/* ================= ARABIC ================= */}
        <div className="bg-white rounded-xl p-4">
          <div className="grid grid-cols-1 gap-4">
            <TextField
              label={t("programName")}
              name="translations[0].name"
              placeholder={t("programName")}
              moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
            />

            <TextField
              label={t("descriptionArabic")}
              name="translations[0].description"
              placeholder={t("descriptionArabic")}
              moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
            />

            <FileUploadField
              label={t("logo")}
              name="logo"
              placeholder={t("uploadPhoto")}
              moreStyle="bg-[#F9F8F8]"
              image={initialValues?.logo}
            />
          </div>
        </div>

        {/* ================= ENGLISH ================= */}
        <div className="bg-white rounded-xl p-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <TextField
              label={t("programNameEnglish")}
              name="translations[1].name"
              placeholder={t("programNameEnglish")}
              moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
            />

            <TextField
              label={t("descriptionEn")}
              name="translations[1].description"
              placeholder={t("descriptionEn")}
              moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
            />
          </div>
        </div>

        <div className="text-end my-5">
          <button
            type="submit"
            disabled={addProgramMutation.isPending}
            className="bg-secondary cursor-pointer hover:bg-secondary-dark text-white px-12 py-1.5 rounded-xl disabled:opacity-50"
          >
            {isLoading ? <ButtonLoader /> : t("saveProgram")}
          </button>
        </div>
      </Form>
    </Formik>
  );
};

export default EditProgramDetailsForm;
