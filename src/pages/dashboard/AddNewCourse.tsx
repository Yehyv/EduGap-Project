import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { addCourse } from "@/features/Dashboard/services/dashboardApis";
import { TextField } from "@/shared/components";
import ButtonLoader from "@/shared/components/ButtonLoader";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import TextareaField from "@/shared/components/forms/TextareaField";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useMutation } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";

/* ================= HELPERS ================= */
const parseWhatToLearn = (value: string): string[] => {
  if (!value) return [];

  return value
    .split(/\n|•/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

const AddNewCourse = () => {
  const { t } = useLanguage();

  /* ================= VALIDATION ================= */
  const courseSchema = Yup.object({
    image: Yup.mixed().required(t("imageRequired")),
    notes: Yup.string().nullable(),
    translations: Yup.array()
      .min(2)
      .required()
      .of(
        Yup.object({
          languageId: Yup.number().required(),
          name: Yup.string().required(t("nameRequired")),
          description: Yup.string().required(t("descriptionRequired")),
          whatToLearn: Yup.string().required(t("whatToLearnRequired")),
        })
      ),
  });

  /* ================= MUTATION ================= */
  const addCourseMutation = useMutation({
    mutationFn: addCourse,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Course added successfully",
        confirmButtonText: "OK",
      });
    },

    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message[0] ||
          "Something went wrong, please try again",
        confirmButtonText: "OK",
      });
    },
  });

  return (
    <>
      <DashboardPageTitle text={t("addNewCourse")} />

      <Formik
        enableReinitialize
        initialValues={{
          image: "",
          notes: "",
          translations: [
            {
              name: "",
              description: "",
              whatToLearn: "",
              durationTime: "",
              languageId: 1, // Arabic
            },
            {
              name: "",
              description: "",
              whatToLearn: "",
              durationTime: "",
              languageId: 2, // English
            },
          ],
        }}
        validationSchema={courseSchema}
        onSubmit={(values, { resetForm }) => {
          const payload = {
            ...values,
            translations: values.translations.map((t) => ({
              ...t,
              whatToLearn: parseWhatToLearn(t.whatToLearn),
            })),
          };

          addCourseMutation.mutate(payload, {
            onSuccess: () => {
              resetForm();
            },
          });
        }}
      >
        <Form>
          {/* ================= BASIC DATA ================= */}
          <div className="bg-white rounded-xl p-4">
            <h4 className="mb-4">{t("courseBasicData")}</h4>

            <div className="grid grid-cols-1 gap-4">
              <TextField
                label={t("courseNameArabic")}
                name="translations[0].name"
                placeholder={t("courseNameArabic")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />

              <TextField
                label={t("descriptionArabic")}
                name="translations[0].description"
                placeholder={t("descriptionArabic")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
              />

              <TextField
                label={t("notes")}
                name="notes"
                placeholder={t("notes")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
              />

              <FileUploadField
                label={t("courseImage")}
                name="image"
                placeholder={t("uploadPhoto")}
                moreStyle="bg-[#F4FBFF]"
              />
            </div>
          </div>

          {/* ================= ARABIC DETAILS ================= */}
          <div className="bg-white rounded-xl p-4 mt-4">
            <h4 className="mb-4">{t("courseDetailsArabic")}</h4>

            <TextareaField
              label={t("whatToLearn")}
              name="translations[0].whatToLearn"
              placeholder={`• ستتعلم أساسيات الكورس
• التعامل مع الأدوات
• تطبيق عملي`}
              moreStyle="!border-[#ACACAC] !bg-[#F9F8F8]"
            />

            <p className="mt-2 text-[#444444] text-sm">
              استخدم • أو سطر جديد للفصل بين النقاط
            </p>
          </div>

          {/* ================= ENGLISH DATA ================= */}
          <div className="bg-white rounded-xl p-4 mt-4">
            <h4 className="mb-4">{t("courseDataEnglish")}</h4>

            <div className="grid grid-cols-1 gap-4">
              <TextField
                label={t("courseNameEnglish")}
                name="translations[1].name"
                placeholder={t("courseNameEnglish")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />

              <TextField
                label={t("descriptionEnglish")}
                name="translations[1].description"
                placeholder={t("descriptionEnglish")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
              />
            </div>
          </div>

          {/* ================= ENGLISH DETAILS ================= */}
          <div className="bg-white rounded-xl p-4 mt-4">
            <h4 className="mb-4">{t("courseDetailsEnglish")}</h4>

            <TextareaField
              label={t("whatToLearn")}
              name="translations[1].whatToLearn"
              placeholder={`• Learn course fundamentals
• Work with tools
• Practical application`}
              moreStyle="!border-[#ACACAC] !bg-[#F9F8F8]"
            />

            <p className="mt-2 text-[#444444] text-sm">
              Use bullet points (•) or line breaks to separate learning
              objectives
            </p>
          </div>

          {/* ================= ACTION ================= */}
          <div className="text-end my-5">
            <button
              type="submit"
              className="bg-secondary cursor-pointer hover:bg-secondary-dark text-white px-12 py-1.5 rounded-xl"
            >
              {addCourseMutation.isPending ? <ButtonLoader /> : t("saveCourse")}
            </button>
          </div>
        </Form>
      </Formik>
    </>
  );
};

export default AddNewCourse;
