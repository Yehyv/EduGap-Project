import { TextField } from "@/shared/components";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { phoneKeys } from "@/shared/utils/globals";
import { useQuery } from "@tanstack/react-query";
import { getInstitutesForDropdownList } from "../services/dashboardApis";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";

const AddOrEditStudent = ({ initialValues, mutate, isPending }) => {
  /* ================= QUERIES ================= */
  const { data: institutesData } = useQuery({
    queryKey: ["getInstitutesForDropdownList"],
    queryFn: getInstitutesForDropdownList,
  });

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
    instituteId: Yup.number().required("Institute is required"),
  });

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={addStudentSchema}
      onSubmit={(values, { resetForm }) => {
        mutate(values, {
          onSuccess: () => {
            resetForm();
          },
        });
      }}
    >
      {({ values, handleChange }) => (
        <Form className="bg-white rounded-xl p-4">
          <div className="grid grid-cols-1 gap-4">
            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
              label="Full Name:"
              name="full_name"
              type="text"
              placeholder="Full Name"
            />
            <TextField
              onlyNumbers
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
              label="National Id:"
              name="national_id"
              type="text"
              placeholder="National Id"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TextField
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                label="Email:"
                name="email"
                type="email"
                placeholder="Email"
              />
              <div className="flex gap-3 ">
                <div className="w-[120px] max-sm:w-full">
                  <DropdownMenu
                    label="Phone Key"
                    name="phone_key"
                    options={phoneKeys}
                  />
                </div>
                <div className="w-full">
                  <TextField
                    moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                    label="Phone:"
                    name="phone"
                    type="text"
                    placeholder="phone number"
                  />
                </div>
              </div>
              <DropdownMenu
                label="Institute"
                name="instituteId"
                options={institutesDataDropdownData ?? []}
              />
            </div>
          </div>
          <div className="text-end mt-10">
            <button
              disabled={isPending}
              type="submit"
              className="bg-secondary disabled:bg-gray-200 hover:bg-secondary-dark cursor-pointer text-white w-42 py-1.5 rounded-xl me-auto"
            >
              {isPending ? <ButtonLoader /> : "Save Student"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddOrEditStudent;
