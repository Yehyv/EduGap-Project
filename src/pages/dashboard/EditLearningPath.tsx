import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editLearningPath,
  learningPathForDashboard,
} from "@/features/Dashboard/services/dashboardApis";
import { TextField } from "@/shared/components";
import ButtonLoader from "@/shared/components/ButtonLoader";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import TextareaField from "@/shared/components/forms/TextareaField";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditLearningPath = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { learningPathId } = useParams();
  /* ================= QUERY ================= */
  const { data, isLoading } = useQuery({
    queryKey: ["learningPathForDashboard", learningPathId],
    queryFn: () => learningPathForDashboard(learningPathId ?? ""),
    enabled: !!learningPathId,
  });
  const learningPathData = data?.data;

  /* ================= VALIDATION ================= */
  const learningPathSchema = Yup.object({
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
  const editLearningPathMutation = useMutation({
    mutationFn: editLearningPath,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Learning path updated successfully",
        confirmButtonText: "OK",
      });
      queryClient.invalidateQueries({ queryKey: ["learningPathForDashboard"] });
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

  if (isLoading) return <CircleLoader />;

  return (
    <>
      <DashboardPageTitle text={t("addNewLearningPath")} />

      <Formik
        enableReinitialize
        initialValues={{
          image: learningPathData?.image,
          learningPathId: learningPathId,
          translations: [
            {
              name: learningPathData?.title,
              description: learningPathData?.description,
              whatToLearn: learningPathData?.learning_outcoms,
              languageId: 1, // Arabic
            },
            {
              name: learningPathData?.title,
              description: learningPathData?.description,
              whatToLearn: learningPathData?.learning_outcoms,
              languageId: 2, // English
            },
          ],
        }}
        validationSchema={learningPathSchema}
        onSubmit={(values, { resetForm }) => {
          const payload = {
            ...values,
            translations: values.translations.map((t) => ({
              ...t,
              whatToLearn: t.whatToLearn,
            })),
          };

          editLearningPathMutation.mutate(payload, {
            onSuccess: () => {
              resetForm();
            },
          });
        }}
      >
        <Form>
          {/* ================= BASIC DATA ================= */}
          <div className="bg-white rounded-xl p-4">
            <h4 className="mb-4">{t("learningPathBasicData")}</h4>

            <div className="grid grid-cols-1 gap-4">
              <TextField
                label={t("learningPathNameArabic")}
                name="translations[0].name"
                placeholder={t("learningPathNameArabic")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />

              <TextField
                label={t("descriptionArabic")}
                name="translations[0].description"
                placeholder={t("descriptionArabic")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
              />

              <FileUploadField
                image={learningPathData?.image}
                label={t("learningPathImage")}
                name="image"
                placeholder={t("uploadPhoto")}
                moreStyle="bg-[#F4FBFF]"
              />
            </div>
          </div>

          {/* ================= ARABIC DETAILS ================= */}
          <div className="bg-white rounded-xl p-4 mt-4">
            <h4 className="mb-4">{t("learningPathDetailsArabic")}</h4>

            <TextareaField
              label={t("whatToLearn")}
              name="translations[0].whatToLearn"
              placeholder={`• ستتعلم أساسيات المسار
• ترتيب المحتوى التعليمي
• تطبيق عملي`}
              moreStyle="!border-[#ACACAC] !bg-[#F9F8F8]"
            />

            <p className="mt-2 text-[#444444] text-sm">
              استخدم • أو سطر جديد للفصل بين النقاط
            </p>
          </div>

          {/* ================= ENGLISH DATA ================= */}
          <div className="bg-white rounded-xl p-4 mt-4">
            <h4 className="mb-4">{t("learningPathDataEnglish")}</h4>

            <div className="grid grid-cols-1 gap-4">
              <TextField
                label={t("learningPathNameEnglish")}
                name="translations[1].name"
                placeholder={t("learningPathNameEnglish")}
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
            <h4 className="mb-4">{t("learningPathDetailsEnglish")}</h4>

            <TextareaField
              label={t("whatToLearn")}
              name="translations[1].whatToLearn"
              placeholder={`• Learn path fundamentals
• Structured learning flow
• Practical implementation`}
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
              className="bg-secondary hover:bg-secondary-dark text-white px-12 py-1.5 rounded-xl"
            >
              {editLearningPathMutation.isPending ? (
                <ButtonLoader />
              ) : (
                t("saveLearningPath")
              )}
            </button>
          </div>
        </Form>
      </Formik>
    </>
  );
};

export default EditLearningPath;
