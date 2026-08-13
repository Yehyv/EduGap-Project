import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editRegion,
  findRegion,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import AddOrEditRegion from "@/features/Dashboard/components/AddOrEditRegion";
import { useLanguage } from "@/shared/localization/useLanguage";

const EditRegion = () => {
  const { regionId } = useParams();
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["findOneRegion"],
    queryFn: () => findRegion(regionId ?? ""),
  });

  const queryClient = useQueryClient();

  const initialValues = {
    regionId: regionId,
    translations: [
      {
        name: data?.data?.name,
        languageId: 1, // Arabic
      },
      {
        name: "",
        languageId: 2, // English
      },
    ],
  };

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: editRegion,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("regionEditedSuccessfully"),
      });

      queryClient.invalidateQueries({ queryKey: ["findOneRegion"] });
    },

    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: error?.response?.data?.message[0] || t("somethingWentWrong"),
      });
    },
  });

  const regionName = data?.data?.name;

  if (isLoading) return <CircleLoader />;

  return (
    <>
      <DashboardPageTitle text={`${t("editRegion")} ${regionName}`} />

      <AddOrEditRegion
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default EditRegion;
