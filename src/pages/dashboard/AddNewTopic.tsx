import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createTopic } from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditTopic from "@/features/Dashboard/components/AddOrEditTopic";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddNewTopic = () => {
  const { t } = useLanguage();
  const { contentId } = useParams();
  const initialValues = {
    contentId: +contentId,
    translations: [
      {
        name: "",
        description: "",
        languageId: 1, // Arabic
      },
      {
        name: "",
        description: "",
        languageId: 2, // English
      },
    ],
  };

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: createTopic,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("topicCreatedSuccessfully"),
      });
    },

    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: error?.response?.data?.message[0] || t("somethingWentWrong"),
      });
    },
  });

  return (
    <>
      <DashboardPageTitle text={t("addNewTopic")} />
      <AddOrEditTopic
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewTopic;
