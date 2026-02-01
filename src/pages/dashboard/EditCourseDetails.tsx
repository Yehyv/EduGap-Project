import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  courseDetailsForDashboard,
  editCourse,
} from "@/features/Dashboard/services/dashboardApis";
import { TextField } from "@/shared/components";
import ButtonLoader from "@/shared/components/ButtonLoader";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import TextareaField from "@/shared/components/forms/TextareaField";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import { useParams } from "react-router-dom";
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

const EditCourseDetails = () => {
  const { t } = useLanguage();
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  /* ================= QUERY ================= */
  const { data } = useQuery({
    queryKey: ["courseDetailsForDashboard", courseId],
    queryFn: () => courseDetailsForDashboard(courseId ?? ""),
    enabled: !!courseId,
  });
  const courseDetailsForUpdate = data?.data;
  const courseDetailsEn = data?.data?.translations?.[0];
  const courseDetailsAr = data?.data?.translations?.[1];

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
        }),
      ),
  });

  /* ================= MUTATION ================= */
  const editCourseMutation = useMutation({
    mutationFn: editCourse,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Course edited successfully",
        confirmButtonText: "OK",
      });
      queryClient.invalidateQueries({
        queryKey: ["courseDetailsForDashboard"],
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
      <DashboardPageTitle text={`Edit Course ${courseDetailsEn?.name ?? ""}`} />

      <Formik
        enableReinitialize
        initialValues={{
          image: courseDetailsForUpdate?.image,
          notes: "",
          courseId: courseId,
          translations: [
            {
              name: courseDetailsAr?.name,
              description: courseDetailsAr?.description,
              whatToLearn: courseDetailsAr?.whatToLearn
                .split(",")
                .map((item) => item.trim())
                .join("\n"),
              languageId: 1, // Arabic
            },
            {
              name: courseDetailsEn?.name,
              description: courseDetailsEn?.description,
              whatToLearn: courseDetailsEn?.whatToLearn
                .split(",")
                .map((item) => item.trim())
                .join("\n"),
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

          editCourseMutation.mutate(payload, {
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
              {/* 
              <TextField
                label={t("notes")}
                name="notes"
                placeholder={t("notes")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
              /> */}

              <FileUploadField
                label={t("courseImage")}
                name="image"
                placeholder={t("uploadPhoto")}
                moreStyle="bg-[#F4FBFF]"
                image={courseDetailsForUpdate?.image}
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
              {editCourseMutation.isPending ? (
                <ButtonLoader />
              ) : (
                t("saveCourse")
              )}
            </button>
          </div>
        </Form>
      </Formik>
    </>
  );
};

export default EditCourseDetails;
