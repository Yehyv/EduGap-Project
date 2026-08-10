import { TextField } from "@/shared/components";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { phoneKeys } from "@/shared/utils/globals";
import { useQuery } from "@tanstack/react-query";
import {
  getAllProgramsForStudent,
  getAllRoles,
  getInstitutesForDropdownList,
} from "../services/dashboardApis";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useParams } from "react-router-dom";

const AddOrEditStudent = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const { t } = useLanguage();
  const { instituteId } = useParams();
  const { data: studentProgramsData } = useQuery({
    queryKey: ["getAllProgramsForStudent", instituteId],
    queryFn: () => getAllProgramsForStudent(instituteId ?? ""),
  });
  const handleProgramsData = studentProgramsData?.data.map((d) => ({
    label: d.name,
    value: d.id,
  }));

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
    full_name: Yup.string().required(t("fullNameRequired")),
    student_id: Yup.string().required(t("studentIdRequired")),
    national_id: Yup.string()
      .required(t("nationalIdRequired"))
      .length(14, t("nationalIdLength")),
    email: Yup.string().email(t("invalidEmail")).required(t("emailRequired")),
    phone_key: Yup.string().required(t("phoneKeyRequired")),
    programId: Yup.string().required(t("programRequired")),
    phone: Yup.string().required(t("phoneRequired")),
    instituteId: isForEdit
      ? Yup.number().nullable()
      : Yup.number().required(t("instituteRequired")),
    roleId: isForEdit
      ? Yup.number().nullable()
      : Yup.number().required(t("roleRequired")),
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
            title: t("warning"),
            text: t("noDataChanged"),
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
              label={t("fullName")}
              name="full_name"
              type="text"
              placeholder={t("fullName")}
            />
            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
              label={t("studentId")}
              name="studentId"
              type="text"
              placeholder={t("studentId")}
            />
            <TextField
              onlyNumbers
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
              label={t("nationalId")}
              name="national_id"
              type="text"
              placeholder={t("nationalId")}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TextField
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
                label={t("email")}
                name="email"
                type="email"
                placeholder={t("email")}
              />
              <DropdownMenu
                label={t("program")}
                name="programId"
                options={handleProgramsData}
              />
              <div className="flex gap-3">
                <div className="w-[120px] max-sm:w-full">
                  <DropdownMenu
                    label={t("phoneKey")}
                    name="phone_key"
                    options={phoneKeys}
                  />
                </div>
                <div className="w-full">
                  <TextField
                    moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
                    label={t("phone")}
                    name="phone"
                    type="text"
                    placeholder={t("phoneNumber")}
                  />
                </div>
              </div>

              {!isForEdit && (
                <>
                  <DropdownMenu
                    label={t("role")}
                    name="roleId"
                    options={handleRoles ?? []}
                  />
                  <DropdownMenu
                    label={t("institute")}
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

export default AddOrEditStudent;
