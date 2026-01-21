import { TextField } from "@/shared/components";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";

const AddOrEditCountry = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const topicSchema = Yup.object({
    translations: Yup.array().of(
      Yup.object({
        name: Yup.string().required("Name is required"),
      }),
    ),
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
                label="Name (AR)"
                name="translations[0].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
              <TextField
                label="Name (EN)"
                name="translations[1].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
            </div>
          </div>

          <div className="text-end mt-10">
            <button
              disabled={isPending}
              type="submit"
              className="hover:bg-secondary-dark text-white px-10 py-1.5 rounded-xl bg-secondary"
            >
              {isPending ? <ButtonLoader /> : "Save Country"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddOrEditCountry;
