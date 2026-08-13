import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editCountry,
  findCountry,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditCountry from "@/features/Dashboard/components/AddOrEditCountry";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import { useLanguage } from "@/shared/localization/useLanguage";

const EditCountry = () => {
  const { countryId } = useParams();
  const { t, lang } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["findOneCountry"],
    queryFn: () => findCountry(countryId ?? ""),
  });
  const queryClient = useQueryClient();

  const initialValues = {
    countryId: countryId,
    translations: [
      {
        name: data?.data?.translations[0]?.name,
        languageId: 1, // Arabic
      },
      {
        name: data?.data?.translations[1]?.name,
        languageId: 2, // English
      },
    ],
  };

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: editCountry,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Country created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["findOneCountry"] });
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
  const countryName =
    lang == "en"
      ? data?.data?.translations[1]?.name
      : data?.data?.translations[0]?.name;

  if (isLoading) return <CircleLoader />;
  return (
    <>
      <DashboardPageTitle text={`${t("editCountry")} ${countryName}`} />
      <AddOrEditCountry
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
        isForEdit={true}
      />
    </>
  );
};

export default EditCountry;
