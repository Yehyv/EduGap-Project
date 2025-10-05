import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
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
          <div>
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
