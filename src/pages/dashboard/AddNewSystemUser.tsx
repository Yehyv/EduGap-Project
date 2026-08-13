import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createSystemUser } from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditSystemUser from "@/features/Dashboard/components/AddOrEditSystemUser";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddNewSystemUser = () => {
  const { t } = useLanguage();
  const initialValues = {
    full_name: "",
    email: "",
    national_id: "",
    phone_key: "",
    phone: "",
    roleId: "",
    instituteId: "",
  };

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: createSystemUser,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("userCreatedSuccessfully"),
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
      <DashboardPageTitle text={t("addNewSystemUser")} />
      <AddOrEditSystemUser
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewSystemUser;
