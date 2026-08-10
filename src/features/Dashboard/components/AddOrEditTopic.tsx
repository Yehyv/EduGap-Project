import { TextField } from "@/shared/components";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";
import TextareaField from "@/shared/components/forms/TextareaField";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddOrEditTopic = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const { t } = useLanguage();

  const topicSchema = Yup.object({
    contentId: Yup.number().required(t("contentRequired")),
    translations: Yup.array().of(
      Yup.object({
        name: Yup.string().required(t("nameRequired")),
        description: Yup.string().required(t("descriptionRequired")),
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
      {() => (
        <Form className="grid gap-4">
          {/* Arabic */}
          <div className="bg-white rounded-xl p-4">
            <h4 className="mb-3">{t("arabicContent")}</h4>
            <div className="grid grid-cols-1 gap-4">
              <TextField
                label={t("nameAr")}
                name="translations[0].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
              <TextareaField
                label={t("descriptionAr")}
                name="translations[0].description"
                moreStyle="!border-[#ACACAC] !rounded-xl !bg-[#F9F8F8]"
              />
            </div>
          </div>

          {/* English */}
          <div className="bg-white rounded-xl p-4">
            <h4 className="my-4">{t("englishContent")}</h4>
            <div className="grid grid-cols-1 gap-4">
              <TextField
                label={t("nameEn")}
                name="translations[1].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />
              <TextareaField
                label={t("descriptionEn")}
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
              {isPending ? <ButtonLoader /> : t("saveTopic")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddOrEditTopic;
