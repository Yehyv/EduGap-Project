import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { addProgram } from "@/features/Dashboard/services/dashboardApis";
import Swal from "sweetalert2";
import ProgramDetailsForm from "@/features/Dashboard/components/ProgramDetailsForm";

const AddNewProgram = () => {
  const { t } = useLanguage();

  /* ================= VALIDATION ================= */
  const programSchema = Yup.object({
    logo: Yup.mixed().required(t("logoRequired")),
    translations: Yup.array()
      .min(2)
      .required()
      .of(
        Yup.object({
          languageId: Yup.number().required(),
          name: Yup.string().required(t("nameRequired")),
          description: Yup.string().required("Description Required"),
        })
      ),
  });
  const initialValues = {
    logo: "",
    translations: [
      { languageId: 1, name: "", description: "" }, // Arabic
      { languageId: 2, name: "", description: "" }, // English
    ],
  };

  /* ================= MUTATION ================= */
  const addProgramMutation = useMutation({
    mutationFn: addProgram,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Program added successfully",
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
      <DashboardPageTitle text={t("addNewProgram")} />

      <ProgramDetailsForm
        addProgramMutation={addProgramMutation}
        programSchema={programSchema}
        initialValues={initialValues}
        isLoading={addProgramMutation?.isPending}
      />
    </>
  );
};

export default AddNewProgram;
