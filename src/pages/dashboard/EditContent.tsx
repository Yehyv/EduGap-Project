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
        title: "Success",
        text: "Content created successfully",
      });
    },

    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Something went wrong, please try again",
        confirmButtonColor: "#dc3545",
      });
    },
  });

  /* ================= FORM DATA BUILDER ================= */
  const buildFormData = (values: AddContentFormValues) => {
    const formData = new FormData();
    console.log(values);

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

    image: Yup.mixed<File>().nullable().required("Content image is required"),

    level: Yup.string().required("Content level is required"),

    adVideo: Yup.string().url("Invalid video URL").required(),

    categoryId: Yup.number().required("Category is required"),

    educator: Yup.number().required("Educator is required"),

    prerequisites: Yup.array().of(Yup.number()),
    translations: Yup.array().of(
      Yup.object({
        languageId: Yup.number().required(),
        levelName: Yup.string().required(),
        name: Yup.string().required("Name is required"),
        description: Yup.string().required("Description is required"),
        levelName: Yup.string().required("Level name is required"),
        languageType: Yup.string().required("Language type is required"),
        whatToLearn: Yup.string().required("What you will learn is required"),
      }),
    ),
  });

  const initialValues: AddContentFormValues = {
    hasPrerequiest: false,
    image: contentData?.image ?? "",
    level: "",
    adVideo: "",
    categoryId: contentData?.categoryId ?? "",
    educator: "",
    prerequisites: [],
    translations: [
      {
        languageId: 1,
        name: contentData?.name ?? "",
        description: contentData?.description ?? "",
        levelName: contentData?.level ?? "",
        previousBackground: "",
        languageType: "",
        whatToLearn:
          formatCommaSeparatedToLines(contentData?.whatToLearn) ?? "",
      },
      {
        languageId: 2,
        name: "",
        description: "",
        levelName: "",
        previousBackground: "",
        languageType: "",
        whatToLearn: "",
      },
    ],
  };

  if (isLoading) return <CircleLoader />;
  if (isError)
    return <ErrorMessage message="Error while get content details" />;
  return (
    <>
      <DashboardPageTitle text={"Edit Training Course"} />
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
              <h4 className="mb-4">Training Course Data</h4>

              <div className="grid grid-cols-1 gap-4">
                <TextField
                  label={"Content Name"}
                  name="translations[0].name"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <TextField
                  label={"Content Description"}
                  name="translations[0].description"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DropdownMenu
                  label={"Category"}
                  name="categoryId"
                  options={handleCategories}
                />
                <DropdownMenu label={"Levels"} name="level" options={LEVELS} />
                <TextField
                  label={"Level Name"}
                  name="translations[0].levelName"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <DropdownMenu
                  label={"Educator"}
                  name="educator"
                  options={handleEducatorsData}
                />
                <MultiSelectDropdown
                  label={"Recommended Prerequisites"}
                  name="prerequisites"
                  options={handleContents}
                />
                <DropdownMenu
                  label={"Language Course"}
                  name="translations[0].languageType"
                  options={LANGUAGES}
                />

                <TextField
                  label={"Course Promo Video Link"}
                  name="adVideo"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />

                <FileUploadField
                  label={"image"}
                  name="image"
                  moreStyle="bg-[#F9F8F8]"
                  placeholder=""
                  image={contentData?.image}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 mt-4">
              <h4 className="mb-4">Training Course Details</h4>
              <TextareaField
                label={t("whatToLearn")}
                name="translations[0].whatToLearn"
                placeholder={`• ستتعلم أساسيات الكورس
• التعامل مع الأدوات
• تطبيق عملي`}
                moreStyle="!border-[#ACACAC] !bg-[#F9F8F8] mb-2"
              />
              <TextareaField
                label={"Basic Requirements"}
                name="translations[0].previousBackground"
                placeholder={`• ستتعلم أساسيات الكورس
• التعامل مع الأدوات
• تطبيق عملي`}
                moreStyle="!border-[#ACACAC] !bg-[#F9F8F8]"
              />

              <DropdownMenu
                label={"Language Course"}
                name="translations[1].languageType"
                options={LANGUAGES}
              />

              <p className="mt-2 text-[#444444] text-sm">
                استخدم • أو سطر جديد للفصل بين النقاط
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 mt-4">
              <h4 className="mb-4">Training Course Data In English</h4>
              <TextField
                label={"Content Name"}
                name="translations[1].name"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />
              <TextField
                label={"Content Description"}
                name="translations[1].description"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
              />

              <TextField
                label={"Level Name"}
                name="translations[1].levelName"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />
            </div>

            <div className="bg-white rounded-xl p-4 mt-4">
              <h4 className="mb-4">Training Course Details In English</h4>
              <TextareaField
                label={t("whatToLearn")}
                name="translations[1].whatToLearn"
                placeholder={`• ستتعلم أساسيات الكورس
• التعامل مع الأدوات
• تطبيق عملي`}
                moreStyle="!border-[#ACACAC] !bg-[#F9F8F8] mb-2"
              />
              <TextareaField
                label={"Basic Requirements"}
                name="translations[1].previousBackground"
                placeholder={`• ستتعلم أساسيات الكورس
• التعامل مع الأدوات
• تطبيق عملي`}
                moreStyle="!border-[#ACACAC] !bg-[#F9F8F8]"
              />

              <p className="mt-2 text-[#444444] text-sm">
                استخدم • أو سطر جديد للفصل بين النقاط
              </p>
            </div>
            <div className="text-end my-5">
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-dark text-white px-12 py-1.5 rounded-xl"
              >
                {isPending ? <ButtonLoader /> : "Save Content"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditContent;
