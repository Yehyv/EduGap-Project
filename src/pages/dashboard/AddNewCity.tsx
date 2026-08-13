import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createCity } from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditCity from "@/features/Dashboard/components/AddOrEditCity";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddNewCity = () => {
  const { t } = useLanguage();

  const initialValues = {
    countryId: "",
    translations: [
      {
        name: "",
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
    mutationFn: createCity,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("city_created_successfully"),
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
      <DashboardPageTitle text={t("add_new_city")} />

      <AddOrEditCity
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewCity;
