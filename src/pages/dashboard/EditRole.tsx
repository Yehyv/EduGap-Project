import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  findOneRole,
  updateRole,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditRole from "@/features/Dashboard/components/AddOrEditRole";
import { useParams } from "react-router-dom";

const EditRole = () => {
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
        title: "Success",
        text: "Role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["findOneRole"] });
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

  return (
    <>
      <DashboardPageTitle text={`Edit Role ${data?.data.role_title ?? ""}`} />
      <AddOrEditRole
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default EditRole;
