import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editTopic,
  getTopicDetails,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditTopic from "@/features/Dashboard/components/AddOrEditTopic";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";

const EditTopic = () => {
  const { contentId, topicId } = useParams();
  const { t } = useLanguage();
  const { data } = useQuery({
    queryKey: ["getTopicDetails"],
    queryFn: () => getTopicDetails(contentId ?? "", topicId ?? ""),
  });
  const handleData = data?.data;
  const initialValues = {
    topicId: +!topicId,
    contentId: +!contentId,
    translations: [
      {
        name: handleData?.name,
        description: handleData?.description,
        languageId: 1, // Arabic
      },
      {
        name: handleData?.name,
        description: handleData?.description,
        languageId: 2, // English
      },
    ],
  };

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: editTopic,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Topic edited successfully",
      });
    },

    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message[0] ||
          "Something went wrong, please try again",
      });
    },
  });

  return (
    <>
      <DashboardPageTitle text={t("edit_topic")} />
      <AddOrEditTopic
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default EditTopic;
