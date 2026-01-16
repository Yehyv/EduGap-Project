import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";

import { TextField } from "@/shared/components";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import ButtonLoader from "@/shared/components/ButtonLoader";
import { createLesson } from "@/features/Dashboard/services/dashboardApis";
import { useParams } from "react-router-dom";
import { LESSON_TYPES } from "@/shared/utils/globals";
import TextareaField from "@/shared/components/forms/TextareaField";

/* ================= OPTIONS ================= */
const lessonTypeOptions = [
  { label: "Lesson", value: LESSON_TYPES.LESSON },
  { label: "Quiz", value: LESSON_TYPES.QUIZ },
];

const AddNewLesson = () => {
  const { topicId } = useParams();
  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Lesson added successfully",
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Something went wrong, please try again",
      });
    },
  });

  /* ================= VALIDATION ================= */
  const lessonSchema = Yup.object({
    topicId: Yup.number().required(),
    lessonType: Yup.string().required("Lesson type is required"),

    videoLink: Yup.string().when("lessonType", {
      is: "lesson",
      then: (schema) =>
        schema.required("Video link is required").url("Invalid video URL"),
      otherwise: (schema) => schema.notRequired(),
    }),

    image: Yup.mixed().required("Image is required"),

    translations: Yup.array().of(
      Yup.object({
        name: Yup.string().required("Name is required"),
        description: Yup.string().required("Description is required"),
      }),
    ),
  });

  /* ================= FORM DATA BUILDER ================= */
  const buildFormData = (values) => {
    const formData = new FormData();

    formData.append("topicId", values.topicId);
    formData.append("lessonType", values.lessonType);
    formData.append(
      "videoLink",
      values.lessonType === "lesson" ? values.videoLink : "",
    );

    formData.append("image", values.image);

    values.translations.forEach((item, index) => {
      formData.append(`translations[${index}][name]`, item.name);
      formData.append(`translations[${index}][description]`, item.description);
      formData.append(`translations[${index}][languageId]`, item.languageId);
    });

    return formData;
  };

  return (
    <>
      <h3 className="mb-4">Add New Lesson</h3>
      <Formik
        initialValues={{
          topicId,
          lessonType: "",
          videoLink: "",
          image: "",
          translations: [
            { name: "", description: "", languageId: 1 },
            { name: "", description: "", languageId: 2 },
          ],
        }}
        validationSchema={lessonSchema}
        onSubmit={(values, { resetForm }) => {
          const formData = buildFormData(values);
          mutate(formData, {
            onSuccess: () => resetForm(),
          });
        }}
      >
        {({ values }) => (
          <Form className="">
            <div className="bg-white rounded-xl p-4 space-y-4">
              {/* Arabic */}
              <div className="grid grid-cols-1 gap-3">
                <TextField
                  label="Lesson Name (Arabic)"
                  name="translations[0].name"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <TextareaField
                  label="Lesson Description (Arabic)"
                  name="translations[0].description"
                  moreStyle="!border-[#ACACAC] !bg-[#F9F8F8]"
                />
              </div>

              {/* Lesson Type */}
              <DropdownMenu
                label="Lesson Type"
                name="lessonType"
                options={lessonTypeOptions}
              />

              {/* Video Link */}
              {+values.lessonType === LESSON_TYPES.LESSON && (
                <TextField
                  label="Video Link"
                  name="videoLink"
                  placeholder="https://..."
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
              )}

              {/* Image */}
              <FileUploadField
                label="Lesson Image"
                name="image"
                moreStyle="bg-[#F9F8F8]"
                placeholder=""
              />
            </div>

            {/* English */}
            <div className="bg-white rounded-xl p-4 space-y-4 my-4">
              <div className="grid grid-cols-1 gap-3">
                <TextField
                  label="Lesson Name (English)"
                  name="translations[1].name"
                />
                <TextField
                  label="Lesson Description (English)"
                  name="translations[1].description"
                  moreStyle="pb-12"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="text-end">
              <button
                type="submit"
                disabled={isPending}
                className="bg-secondary hover:bg-secondary-dark text-white px-10 py-1.5 rounded-xl disabled:opacity-50"
              >
                {isPending ? <ButtonLoader /> : "Save Lesson"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AddNewLesson;
