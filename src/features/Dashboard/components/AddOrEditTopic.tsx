import { TextField } from "@/shared/components";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";
import TextareaField from "@/shared/components/forms/TextareaField";

const AddOrEditTopic = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const topicSchema = Yup.object({
    contentId: Yup.number().required("Content is required"),
    translations: Yup.array().of(
      Yup.object({
        name: Yup.string().required("Name is required"),
        description: Yup.string().required("Description is required"),
        languageId: Yup.number().required(),
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
            <h4 className="mb-3">Arabic Content</h4>
            <div className="grid grid-cols-1 gap-4">
              <TextField
                label="Name (AR)"
                name="translations[0].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
              <TextareaField
                label="Description (AR)"
                name="translations[0].description"
                moreStyle="!border-[#ACACAC] !rounded-xl !bg-[#F9F8F8]"
              />
            </div>
          </div>

          {/* English */}
          <div className="bg-white rounded-xl p-4">
            <h4 className="my-4">English Content</h4>
            <div className="grid grid-cols-1 gap-4">
              <TextField
                label="Name (EN)"
                name="translations[1].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
              <TextareaField
                label="Description (EN)"
                name="translations[1].description"
                moreStyle="!border-[#ACACAC] !rounded-xl !bg-[#F9F8F8]"
              />
            </div>
          </div>

          <div className="text-end mt-10">
            <button
              disabled={isPending}
              type="submit"
              className="hover:bg-secondary-dark text-white px-10 py-1.5 rounded-xl bg-secondary"
            >
              {isPending ? <ButtonLoader /> : "Save Topic"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddOrEditTopic;
