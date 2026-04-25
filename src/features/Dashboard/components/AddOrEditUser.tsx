import { TextField } from "@/shared/components";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { phoneKeys } from "@/shared/utils/globals";
import { useQuery } from "@tanstack/react-query";
import {
  getAllRoles,
  getInstitutesForDropdownList,
} from "../services/dashboardApis";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddOrEditUser = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const { t } = useLanguage();

  /* ================= QUERIES ================= */
  // Only fetch when the dropdowns are actually rendered (add mode)
  const { data: institutesData } = useQuery({
    queryKey: ["getInstitutesForDropdownList"],
    queryFn: getInstitutesForDropdownList,
    enabled: !isForEdit,
  });

  const { data } = useQuery({
    queryKey: ["getRolesList"],
    queryFn: () => getAllRoles(1, 50),
    enabled: !isForEdit,
  });

  const handleRoles = data?.data.items.map((c) => ({
    label: c.role_title,
    value: c.id,
  }));

  const institutesDataDropdownData = institutesData?.data?.map((e) => ({
    label: e?.name,
    value: e?.id,
  }));

  /* ================= VALIDATION ================= */
  const addStudentSchema = Yup.object({
    full_name: Yup.string().required("Full name is required"),
    national_id: Yup.string()
      .required("National ID is required")
      .length(14, "National ID must be 14 digits"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone_key: Yup.string().required("Phone key is required"),
    phone: Yup.string().required("Phone is required"),
    instituteId: isForEdit
      ? Yup.number().nullable()
      : Yup.number().required("Institute is required"),
    roleId: isForEdit
      ? Yup.number().nullable()
      : Yup.number().required("Role is required"),
  });

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={addStudentSchema}
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
      {({ values, handleChange }) => (
        <Form className="bg-white rounded-xl p-4">
          <div className="grid grid-cols-1 gap-4">
            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
              label="Full Name:"
              name="full_name"
              type="text"
              placeholder="Full Name"
            />
            <TextField
              onlyNumbers
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
              label="National Id:"
              name="national_id"
              type="text"
              placeholder="National Id"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TextField
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
                label="Email:"
                name="email"
                type="email"
                placeholder="Email"
              />
              <div className="flex gap-3">
                <div className="w-[120px] max-sm:w-full">
                  <DropdownMenu
                    label="Phone Key"
                    name="phone_key"
                    options={phoneKeys}
                  />
                </div>
                <div className="w-full">
                  <TextField
                    moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
                    label="Phone:"
                    name="phone"
                    type="text"
                    placeholder="phone number"
                  />
                </div>
              </div>

              {!isForEdit && (
                <>
                  <DropdownMenu
                    label="Role"
                    name="roleId"
                    options={handleRoles ?? []}
                  />
                  <DropdownMenu
                    label="Institute"
                    name="instituteId"
                    options={institutesDataDropdownData ?? []}
                  />
                </>
              )}
            </div>
          </div>

          <div className="text-end mt-10">
            <button
              disabled={isPending}
              type="submit"
              className="bg-secondary disabled:bg-gray-200 hover:bg-secondary-dark cursor-pointer text-white w-42 py-1.5 rounded-xl me-auto"
            >
              {isPending ? <ButtonLoader /> : t("save")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddOrEditUser;
