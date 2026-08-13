import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { useLanguage } from "@/shared/localization/useLanguage";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  editProgram,
  programDetailsForAdmin,
} from "@/features/Dashboard/services/dashboardApis";
import Swal from "sweetalert2";
import ProgramDetailsForm from "@/features/Dashboard/components/ProgramDetailsForm";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";

const EditProgramDetails = () => {
  const { t } = useLanguage();
  const { programId } = useParams();
  const queryClient = useQueryClient();
  /* ================= QUERY ================= */
  const { data, isLoading, error } = useQuery({
    queryKey: ["programDetails", programId],
    queryFn: () => programDetailsForAdmin(programId ?? ""),
    enabled: !!programId,
  });
  const programData = data?.data;
  const programDataAr = data?.data?.translations[0];
  const programDataEn = data?.data?.translations[1];

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
          description: Yup.string().required(t("descriptionRequired")),
        }),
      ),
  });

  /* ================= MUTATION ================= */
  const editProgramMutation = useMutation({
    mutationFn: editProgram,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("programAddedSuccessfully"),
        confirmButtonText: t("ok"),
      });
      queryClient.invalidateQueries({ queryKey: ["programDetails"] });
    },

    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text:
          error?.response?.data?.message[0] || t("somethingWentWrongTryAgain"),
        confirmButtonText: t("ok"),
      });
    },
  });

  const initialValues = {
    programId: programId,
    logo: programData?.logo,
    translations: [
      {
        languageId: 1,
        name: programDataEn?.name,
        description: programDataEn?.description,
      }, // Arabic
      {
        languageId: 2,
        name: programDataAr?.name,
        description: programDataAr?.description,
      }, // English
    ],
  };

  if (isLoading) return <CircleLoader />;
  if (error)
    return (
      <ErrorMessage
        message={error.message || t("errorWhileGettingProgramDetails")}
      />
    );
  return (
    <>
      <DashboardPageTitle text={t("editProgramDetails")} />

      <ProgramDetailsForm
        addProgramMutation={editProgramMutation}
        programSchema={programSchema}
        initialValues={initialValues}
        isLoading={editProgramMutation?.isPending}
      />
    </>
  );
};

export default EditProgramDetails;
