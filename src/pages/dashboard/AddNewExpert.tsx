import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { addExpert } from "@/features/Dashboard/services/dashboardApis";
import Swal from "sweetalert2";
import ExpertDetailsForm from "@/features/Dashboard/components/ExpertDetailsForm";

const AddNewExpert = () => {
  const { t } = useLanguage();

  /* ================= VALIDATION ================= */
  const programSchema = Yup.object({
    image: Yup.mixed().required(t("imageRequired")),
    title: Yup.string().required(t("nameRequired")),
    bio: Yup.string().required("Description Required"),
    userId: Yup.string().required("User Is Required"),
  });
  const initialValues = {
    image: "",
    userId: "",
    title: "",
    bio: "",
  };

  /* ================= MUTATION ================= */
  const addExpertMutation = useMutation({
    mutationFn: addExpert,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Expert added successfully",
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
      <DashboardPageTitle text={t("addNewExpert")} />

      <ExpertDetailsForm
        addProgramMutation={addExpertMutation}
        programSchema={programSchema}
        initialValues={initialValues}
        isLoading={addExpertMutation?.isPending}
      />
    </>
  );
};

export default AddNewExpert;
