import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createCountry } from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditCountry from "@/features/Dashboard/components/AddOrEditCountry";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddNewCountry = () => {
  const { t } = useLanguage();
  const initialValues = {
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
    mutationFn: createCountry,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("CountryCreatedSuccessfully"),
      });
    },

    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message[0] || t("somethingWentWrong"),
      });
    },
  });

  return (
    <>
      <DashboardPageTitle text={t("add_new_country")} />
      <AddOrEditCountry
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewCountry;
