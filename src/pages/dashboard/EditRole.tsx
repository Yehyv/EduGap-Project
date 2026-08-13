import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  findOneRole,
  updateRole,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditRole from "@/features/Dashboard/components/AddOrEditRole";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";

const EditRole = () => {
  const { t } = useLanguage();
  const { roleId } = useParams();
  const { data } = useQuery({
    queryKey: ["findOneRole"],
    queryFn: () => findOneRole(roleId ?? ""),
  });
  const queryClient = useQueryClient();
  const initialValues = {
    roleId: roleId,
    role_title: data?.data.role_title,
    role_category: data?.data.role_category,
  };

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: updateRole,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("roleUpdatedSuccessfully"),
      });
      queryClient.invalidateQueries({ queryKey: ["findOneRole"] });
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
      <DashboardPageTitle
        text={`${t("editRole")} ${data?.data.role_title ?? ""}`}
      />
      <AddOrEditRole
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default EditRole;
