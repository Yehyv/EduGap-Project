import { TextField } from "@/shared/components";
import ButtonLoader from "@/shared/components/ButtonLoader";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import Swal from "sweetalert2";
import { getStudents } from "../services/dashboardApis";

const ExpertDetailsForm = ({
  programSchema,
  addProgramMutation,
  initialValues,
  isLoading,
  isForEdit = false,
}) => {
  const { t } = useLanguage();
  const { data: studentsData } = useQuery({
    queryKey: ["getAllUsers"],
    queryFn: () => getStudents(),
  });
  const handleGetUsersData = studentsData?.data?.data?.users?.map((u) => ({
    label: u.name,
    value: u.id,
  }));

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={programSchema}
      onSubmit={(values, { resetForm }) => {
        if (JSON.stringify(initialValues) === JSON.stringify(values)) {
          Swal.fire({
            icon: "warning",
            title: "Warning",
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
            {!isForEdit && (
              <DropdownMenu
                label={t("user")}
                name="userId"
                options={handleGetUsersData}
                isDisabled={true}
              />
            )}

            <TextField
              label={t("expert_title")}
              name="title"
              placeholder={t("expert_title")}
              moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
            />

            <TextField
              label={t("expert_bio")}
              name="bio"
              placeholder={t("expert_bio")}
              moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
            />

            <FileUploadField
              label={t("expertImage")}
              name="image"
              placeholder={t("expertImage")}
              moreStyle="bg-[#F4FBFF]"
              image={initialValues?.image}
            />
          </div>
        </div>

        <div className="text-end my-5">
          <button
            type="submit"
            disabled={addProgramMutation.isPending}
            className="bg-secondary cursor-pointer hover:bg-secondary-dark text-white px-12 py-1.5 rounded-xl disabled:opacity-50"
          >
            {isLoading ? <ButtonLoader /> : t("saveExpert")}
          </button>
        </div>
      </Form>
    </Formik>
  );
};

export default ExpertDetailsForm;
