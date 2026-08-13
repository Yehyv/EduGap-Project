import { TextField } from "@/shared/components";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { useQuery } from "@tanstack/react-query";
import { getRoleCategories } from "../services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddOrEditRole = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const { t } = useLanguage();
  const topicSchema = Yup.object({
    role_title: Yup.string().required(t("roleTitleRequired")),
    role_category: Yup.string().required(t("roleCategoryRequired")),
  });
  const { data } = useQuery({
    queryKey: ["getRoleCategories"],
    queryFn: getRoleCategories,
  });
  const handleRoleCategoires = data?.data.map((c) => ({ label: c, value: c }));

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={topicSchema}
      onSubmit={(values, { resetForm }) => {
        if (JSON.stringify(initialValues) === JSON.stringify(values)) {
          Swal.fire({
            icon: "warning",
            title: t("warning"),
            text: t("youDidntChangeTheData"),
          });
          return;
        }

        mutate(values, {
          onSuccess: () => {
            if (!isForEdit) resetForm();
          },
        });
      }}
    >
      {() => (
        <Form className="grid gap-4">
          {/* Arabic */}
          <div className="bg-white rounded-xl p-4">
            <div className="grid grid-cols-1 gap-4">
              <TextField
                label={t("roleTitle")}
                name="role_title"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
              <DropdownMenu
                label={t("category")}
                name="role_category"
                options={handleRoleCategoires}
              />
            </div>
          </div>

          <div className="text-end mt-10">
            <button
              disabled={isPending}
              type="submit"
              className="hover:bg-secondary-dark text-white px-10 py-1.5 rounded-xl bg-secondary"
            >
              {isPending ? <ButtonLoader /> : t("saveRole")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddOrEditRole;
