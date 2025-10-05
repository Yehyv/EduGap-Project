import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField } from "@/shared/components";
import SelectField from "@/shared/components/forms/SelectField";
import TextareaField from "@/shared/components/forms/TextareaField";

const AddNotesInLesson = () => {
  return (
    <Formik
      initialValues={{ note: "" }}
      validationSchema={Yup.object({
        note: Yup.string()
          .max(20, "الحد الأقصى 20 حرف")
          .required("الملاحظة مطلوبة"),
      })}
      onSubmit={(values, { resetForm }) => {
        console.log("Form Submitted:", values);
        resetForm();
      }}
    >
      {({ errors, touched }) => (
        <Form className="mt-4 space-y-3">
          {/* You can wrap your own TextField with Formik's Field */}
          <div className="flex gap-4 items-start">
            <div className="w-1/4">
              <Field
                as={TextField}
                maxLength={20}
                onlyNumbers={false}
                name="note"
                type="text"
                placeholder="الملاحظات"
                label=""
              />
            </div>
            <div className="w-full mt-1">
              <SelectField
                name="lessonName"
                placeholder="lesson name"
                options={[
                  {
                    label: "تعريف الذكاء الاصطناعي",
                    value: "تعريف الذكاء الاصطناعي",
                  },
                ]}
                label=""
              />
            </div>
          </div>
          <TextareaField name="notes" label="" rows={3} />

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            حفظ
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default AddNotesInLesson;
