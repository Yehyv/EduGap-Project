import { TextField } from "@/shared/components";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { useQuery } from "@tanstack/react-query";
import {
  getAllRoles,
  getInstitutesForDropdownList,
} from "../services/dashboardApis";
import { phoneKeys } from "@/shared/utils/globals";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddOrEditSystemUser = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const { t } = useLanguage();

  const { data } = useQuery({
    queryKey: ["getRolesList"],
    queryFn: () => getAllRoles(1, 50),
  });

  const { data: instituteData } = useQuery({
    queryKey: ["getInstitutesForDropdownList"],
    queryFn: () => getInstitutesForDropdownList(),
  });

  const handleRoles = data?.data.items.map((c) => ({
    label: c.role_title,
    value: c.id,
  }));

  const handleInstituteData = instituteData?.data?.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const getRoleNameById = (roleId) => {
    const role = data?.data.items.find((r) => String(r.id) === String(roleId));
    return role?.role_title ?? "";
  };

  const topicSchema = Yup.object({
    full_name: Yup.string()
      .required(t("fullNameRequired"))
      .matches(/^[a-zA-Z\s]+$/, t("fullNameLettersOnly")),

    email: Yup.string()
      .required(t("emailRequired"))
      .email(t("pleaseEnterValidEmail")),

    national_id: Yup.string()
      .required(t("nationalIdRequired"))
      .matches(/^[23]\d{13}$/, t("nationalIdMustBe14Digits")),

    phone_key: Yup.string().required(t("countryCodeRequired")),

    phone: Yup.string()
      .required(t("phoneNumberRequired"))
      .matches(/^01[0-2,5]\d{8}$/, t("pleaseEnterValidEgyptianPhone")),

    roleId: Yup.string().required(t("roleRequired")),

    instituteId: Yup.string().when("roleId", {
      is: (roleId) => {
        const roleName = getRoleNameById(roleId);
        return roleName === "SUPER_ADMIN" || roleName === "ADMIN";
      },
      then: (schema) => schema.optional(),
      otherwise: (schema) => schema.required(t("instituteRequired")),
    }),
  });

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
      {({ values, setFieldValue }) => {
        const selectedRoleName = getRoleNameById(values.roleId);
        const isDisabled =
          selectedRoleName === "SUPER_ADMIN" || selectedRoleName === "ADMIN";

        const handleRoleChange = (roleId) => {
          setFieldValue("roleId", roleId);
          const roleName = getRoleNameById(roleId);
          if (roleName === "SUPER_ADMIN" || roleName === "ADMIN") {
            setFieldValue("instituteId", "");
          }
        };

        return (
          <Form className="grid gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="grid grid-cols-1 gap-4">
                <TextField
                  label={t("fullName")}
                  name="full_name"
                  moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
                  required
                />
                <TextField
                  label={t("email")}
                  name="email"
                  moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
                  required
                />
                <TextField
                  label={t("nationalId")}
                  name="national_id"
                  moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
                  required
                />
                <div className="flex gap-3">
                  <div className="w-[120px]">
                    <DropdownMenu
                      label={t("phoneKey")}
                      name="phone_key"
                      options={phoneKeys}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <TextField
                      label={t("phone")}
                      name="phone"
                      moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                  <DropdownMenu
                    label={t("role")}
                    name="roleId"
                    options={handleRoles}
                    onChange={handleRoleChange}
                    required
                  />
                  <DropdownMenu
                    label={t("institute")}
                    name="instituteId"
                    options={handleInstituteData}
                    disabled={isDisabled}
                    required={!isDisabled}
                  />
                </div>
              </div>
            </div>

            <div className="text-end mt-10">
              <button
                disabled={isPending}
                type="submit"
                className="hover:bg-secondary-dark text-white px-10 py-1.5 rounded-xl bg-secondary"
              >
                {isPending ? <ButtonLoader /> : t("saveSystemUser")}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddOrEditSystemUser;
