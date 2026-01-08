import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  editExpert,
  getExpertDetailsForDashboard,
} from "@/features/Dashboard/services/dashboardApis";
import Swal from "sweetalert2";
import ExpertDetailsForm from "@/features/Dashboard/components/ExpertDetailsForm";
import { useParams } from "react-router-dom";

const EditExpertDetails = () => {
  const { t } = useLanguage();
  const { expertId } = useParams();

  const { data: expertData } = useQuery({
    queryKey: ["getExpertDetails", expertId],
    queryFn: () => getExpertDetailsForDashboard(expertId ?? ""),
  });
  const queryClient = useQueryClient();

  /* ================= VALIDATION ================= */
  const programSchema = Yup.object({
    image: Yup.mixed().required(t("imageRequired")),
    title: Yup.string().required(t("nameRequired")),
    bio: Yup.string().required("Description Required"),
    userId: Yup.string().required("User Is Required"),
  });
  const initialValues = {
    image: expertData?.data.image,
    userId: expertData?.data.id,
    title: expertData?.data.title,
    bio: expertData?.data.bio,
  };

  /* ================= MUTATION ================= */
  const editExpertMutation = useMutation({
    mutationFn: editExpert,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Expert added successfully",
        confirmButtonText: "OK",
      });
      queryClient.invalidateQueries({
        queryKey: ["getExpertDetails", expertId],
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
      <DashboardPageTitle text={t("editExpertDetails")} />

      <ExpertDetailsForm
        isForEdit={true}
        addProgramMutation={editExpertMutation}
        programSchema={programSchema}
        initialValues={initialValues}
        isLoading={editExpertMutation?.isPending}
      />
    </>
  );
};

export default EditExpertDetails;
