import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editContent,
  getAllContentsForDropdown,
  getCategories,
  getExpertsForDashboard,
  instituteContentDetails,
} from "@/features/Dashboard/services/dashboardApis";
import { TextField } from "@/shared/components";
import ButtonLoader from "@/shared/components/ButtonLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import TextareaField from "@/shared/components/forms/TextareaField";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import MultiSelectDropdown from "@/shared/components/ui/MultiSelectDropdown";
import { useLanguage } from "@/shared/localization/useLanguage";
import {
  formatCommaSeparatedToLines,
  LANGUAGES,
  LEVELS,
  parseWhatToLearn,
} from "@/shared/utils/globals";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";

interface Translation {
  languageId: number;
  name: string;
  description: string;
  levelName: string;
  previousBackground: string;
  languageType: string;
  whatToLearn: string;
}

interface AddContentFormValues {
  hasPrerequiest: boolean;
  image: File | null;
  level: string;
  adVideo: string;
  categoryId: number | "";
  educator: number | "";
  prerequisites: number[];
  translations: Translation[];
}

const EditContent = () => {
  const { t } = useLanguage();
  const { data } = useQuery({
    queryKey: ["getCategories"],
    queryFn: getCategories,
  });
  const { data: contentsData } = useQuery({
    queryKey: ["getContents"],
    queryFn: getAllContentsForDropdown,
  });
  const { contentId } = useParams();
  /* ================= QUERY ================= */
  const {
    data: content,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getContentDetails", contentId],
    queryFn: () => instituteContentDetails(contentId ?? ""),
    enabled: !!contentId,
  });

  const contentData = content?.data;
  const contentDataAr = contentData?.translations[0];
  const contentDataEn = contentData?.translations[1];

  const handleContents = contentsData?.data.map((c) => ({
    label: c.name,
    value: c.id,
  }));
  // must change this endpoint to new one just get name & id
  const { data: educatorsData } = useQuery({
    queryKey: ["getEducatorsData"],
    queryFn: getExpertsForDashboard,
  });
  const handleEducatorsData = educatorsData?.data.items.map((e) => ({
    label: e.user.full_name,
    value: e.user.id,
  }));
  const handleCategories = data?.data.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: ({ contentId, formData }) => editContent(contentId, formData),

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("contentCreatedSuccessfully"),
      });
    },

    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: error?.response?.data?.message || t("somethingWentWrong"),
        confirmButtonColor: "#dc3545",
      });
    },
  });

  /* ================= FORM DATA BUILDER ================= */
  const buildFormData = (values: AddContentFormValues) => {
    const formData = new FormData();

    formData.append(
      "hasPrerequiest",
      String(values.prerequisites?.length > 0 ? 1 : 0),
    );
    formData.append("level", values.level);
    formData.append("adVideo", values.adVideo);
    formData.append("categoryId", String(values.categoryId));
    formData.append("educator", String(values.educator));

    if (values.image) {
      formData.append("image", values.image);
    }

    values.prerequisites.forEach((id, index) => {
      formData.append(`prerequisites[${index}]`, String(id));
    });

    values.translations.forEach((item, index) => {
      formData.append(
        `translations[${index}][languageId]`,
        String(item.languageId),
      );
      formData.append(`translations[${index}][name]`, item.name);
      formData.append(`translations[${index}][description]`, item.description);
      formData.append(`translations[${index}][levelName]`, item.levelName);
      formData.append(
        `translations[${index}][previousBackground]`,
        item.previousBackground,
      );
      formData.append(
        `translations[${index}][languageType]`,
        item.languageType,
      );

      formData.append(`translations[${index}][whatToLearn]`, item.whatToLearn);
    });

    return formData;
  };

  const contentSchema: Yup.Schema<AddContentFormValues> = Yup.object({
    hasPrerequiest: Yup.boolean().required(),

    image: Yup.mixed<File>().nullable().required(t("contentImageRequired")),

    level: Yup.string().required(t("contentLevelRequired")),

    adVideo: Yup.string().url(t("invalidVideoUrl")).required(),

    categoryId: Yup.number().required(t("categoryRequired")),

    educator: Yup.number().required(t("educatorRequired")),

    prerequisites: Yup.array().of(Yup.number()),
    translations: Yup.array().of(
      Yup.object({
        languageId: Yup.number().required(),
        levelName: Yup.string().required(),
        name: Yup.string().required(t("nameRequired")),
        description: Yup.string().required(t("descriptionRequired")),
        levelName: Yup.string().required(t("levelNameRequired")),
        languageType: Yup.string().required(t("languageTypeRequired")),
        whatToLearn: Yup.string().required(t("whatToLearnRequired")),
      }),
    ),
  });

  const initialValues: AddContentFormValues = {
    hasPrerequiest: false,
    image: contentData?.image ?? "",
    level: contentData?.level,
    adVideo: "",
    categoryId: contentData?.category?.id ?? "",
    educator: "",
    prerequisites: [],
    translations: [
      {
        languageId: 1,
        name: contentDataAr?.name ?? "",
        description: contentDataAr?.description ?? "",
        levelName: contentDataAr?.level ?? "",
        previousBackground: "",
        languageType: "",
        whatToLearn:
          formatCommaSeparatedToLines(contentDataAr?.whatToLearn) ?? "",
      },
      {
        languageId: 2,
        name: contentDataEn?.name ?? "",
        description: contentDataEn?.description ?? "",
        levelName: contentDataEn?.level ?? "",
        previousBackground: "",
        languageType: "",
        whatToLearn:
          formatCommaSeparatedToLines(contentDataEn?.whatToLearn) ?? "",
      },
    ],
  };

  const bulletPlaceholder = t("bulletPointsPlaceholder");

  if (isLoading) return <CircleLoader />;
  if (isError)
    return <ErrorMessage message={t("errorGettingContentDetails")} />;
  return (
    <>
      <DashboardPageTitle text={t("editTrainingCourse")} />
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={contentSchema}
        onSubmit={(values, { resetForm }) => {
          const formData = buildFormData(values);

          mutate(
            {
              contentId,
              formData,
            },
            {
              onSuccess: () => {
                resetForm();
              },
            },
          );
        }}
      >
        {() => (
          <Form>
            <div className="bg-white rounded-xl p-4">
              <h4 className="mb-4">{t("trainingCourseData")}</h4>

              <div className="grid grid-cols-1 gap-4">
                <TextField
                  label={t("contentName")}
                  name="translations[0].name"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <TextField
                  label={t("contentDescription")}
                  name="translations[0].description"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DropdownMenu
                  label={t("category")}
                  name="categoryId"
                  options={handleCategories}
                />
                <DropdownMenu
                  label={t("levels")}
                  name="level"
                  options={LEVELS}
                />
                <TextField
                  label={t("levelName")}
                  name="translations[0].levelName"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <DropdownMenu
                  label={t("educator")}
                  name="educator"
                  options={handleEducatorsData}
                />
                <MultiSelectDropdown
                  label={t("recommendedPrerequisites")}
                  name="prerequisites"
                  options={handleContents}
                />
                <DropdownMenu
                  label={t("languageCourse")}
                  name="translations[0].languageType"
                  options={LANGUAGES}
                />

                <TextField
                  label={t("coursePromoVideoLink")}
                  name="adVideo"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />

                <FileUploadField
                  label={t("image")}
                  name="image"
                  moreStyle="bg-[#F9F8F8]"
                  placeholder=""
                  image={contentData?.image}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 mt-4">
              <h4 className="mb-4">{t("trainingCourseDetails")}</h4>
              <TextareaField
                label={t("whatToLearn")}
                name="translations[0].whatToLearn"
                placeholder={bulletPlaceholder}
                moreStyle="!border-[#ACACAC] !bg-[#F9F8F8] mb-2"
              />
              <TextareaField
                label={t("basicRequirements")}
                name="translations[0].previousBackground"
                placeholder={bulletPlaceholder}
                moreStyle="!border-[#ACACAC] !bg-[#F9F8F8]"
              />

              <DropdownMenu
                label={t("languageCourse")}
                name="translations[1].languageType"
                options={LANGUAGES}
              />

              <p className="mt-2 text-[#444444] text-sm">
                {t("bulletPointsHint")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 mt-4">
              <h4 className="mb-4">{t("trainingCourseDataInEnglish")}</h4>
              <TextField
                label={t("contentName")}
                name="translations[1].name"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />
              <TextField
                label={t("contentDescription")}
                name="translations[1].description"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
              />

              <TextField
                label={t("levelName")}
                name="translations[1].levelName"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />
            </div>

            <div className="bg-white rounded-xl p-4 mt-4">
              <h4 className="mb-4">{t("trainingCourseDetailsInEnglish")}</h4>
              <TextareaField
                label={t("whatToLearn")}
                name="translations[1].whatToLearn"
                placeholder={bulletPlaceholder}
                moreStyle="!border-[#ACACAC] !bg-[#F9F8F8] mb-2"
              />
              <TextareaField
                label={t("basicRequirements")}
                name="translations[1].previousBackground"
                placeholder={bulletPlaceholder}
                moreStyle="!border-[#ACACAC] !bg-[#F9F8F8]"
              />

              <p className="mt-2 text-[#444444] text-sm">
                {t("bulletPointsHint")}
              </p>
            </div>
            <div className="text-end my-5">
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-dark text-white px-12 py-1.5 rounded-xl"
              >
                {isPending ? <ButtonLoader /> : t("saveContent")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditContent;
