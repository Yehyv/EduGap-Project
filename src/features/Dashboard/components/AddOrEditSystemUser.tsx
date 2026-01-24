import { TextField } from "@/shared/components";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { useQuery } from "@tanstack/react-query";
import { getAllRoles } from "../services/dashboardApis";
import { phoneKeys } from "@/shared/utils/globals";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddOrEditSystemUser = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const topicSchema = Yup.object({
    full_name: Yup.string()
      .required("Full name is required")
      .matches(/^[a-zA-Z\s]+$/, "Full name must contain letters only"),

    email: Yup.string()
      .required("Email is required")
      .email("Please enter a valid email address"),

    national_id: Yup.string()
      .required("National ID is required")
      .matches(
        /^[23]\d{13}$/,
        "National ID must be 14 digits and start with 2 or 3",
      ),

    phone_key: Yup.string().required("Country code is required"),

    phone: Yup.string()
      .required("Phone number is required")
      .matches(
        /^01[0-2,5]\d{8}$/,
        "Please enter a valid Egyptian phone number",
      ),

    roleId: Yup.string().required("Role is required"),
  });
  const { t } = useLanguage();
  const { data } = useQuery({
    queryKey: ["getRolesList"],
    queryFn: () => getAllRoles(1, 50),
  });

  const handleRoles = data?.data.items.map((c) => ({
    label: c.role_title,
    value: c.id,
  }));
  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={topicSchema}
      onSubmit={(values, { resetForm }) => {
        if (JSON.stringify(initialValues) === JSON.stringify(values)) {
          Swal.fire({
            icon: "warning",
            title: "Warning",
            text: "You didn't change the data",
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
                label="Full Name"
                name="full_name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
              <TextField
                label="Email"
                name="email"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
              <TextField
                label="National Id"
                name="national_id"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
              <div className="flex gap-3">
                <div className="w-[120px]">
                  <DropdownMenu
                    label={t("phoneKey")}
                    name="phone_key"
                    options={phoneKeys}
                  />
                </div>
                <div className="w-full">
                  <TextField
                    label={t("phone")}
                    name="phone"
                    moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                  />
                </div>
              </div>
              <DropdownMenu
                label={"Role"}
                name="roleId"
                options={handleRoles}
              />
            </div>
          </div>

          <div className="text-end mt-10">
            <button
              disabled={isPending}
              type="submit"
              className="hover:bg-secondary-dark text-white px-10 py-1.5 rounded-xl bg-secondary"
            >
              {isPending ? <ButtonLoader /> : "Save System User"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddOrEditSystemUser;
