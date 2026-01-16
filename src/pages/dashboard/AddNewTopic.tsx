import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createTopic } from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditTopic from "@/features/Dashboard/components/AddOrEditTopic";
import { useParams } from "react-router-dom";

const AddNewTopic = () => {
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
        title: "Success",
        text: "Topic created successfully",
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
      <DashboardPageTitle text="Add New Topic" />
      <AddOrEditTopic
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewTopic;
