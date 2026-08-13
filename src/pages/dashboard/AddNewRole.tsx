import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createRole } from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditRole from "@/features/Dashboard/components/AddOrEditRole";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddNewRole = () => {
  const { t } = useLanguage();
  const initialValues = {
    role_title: "",
    role_category: "",
  };

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: createRole,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("roleCreatedSuccessfully"),
      });
    },

    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text:
          error?.response?.data?.message[0] || t("somethingWentWrongTryAgain"),
      });
    },
  });

  return (
    <>
      <DashboardPageTitle text={t("addNewRole")} />
      <AddOrEditRole
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewRole;
