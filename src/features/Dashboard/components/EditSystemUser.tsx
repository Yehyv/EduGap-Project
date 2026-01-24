import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editSystemUser,
  findOneSystemUser,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditSystemUser from "@/features/Dashboard/components/AddOrEditSystemUser";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";

const EditSystemUser = () => {
  const { systemUserId } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["findOneSystemUser", systemUserId],
    queryFn: () => findOneSystemUser(systemUserId ?? ""),
  });
  const initialValues = {
    systemUserId: systemUserId,
    full_name: data?.data.full_name,
    email: data?.data.email,
    national_id: data?.data.national_id,
    phone_key: data?.data.phone_key,
    phone: data?.data.phone,
    roleId: data?.data.SysUserrole?.id,
  };
  const queryClient = useQueryClient();
  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: editSystemUser,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["findOneSystemUser"] });
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
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <DashboardPageTitle
        text={`Edit System User ${data?.data.full_name ?? ""}`}
      />
      {isLoading ? (
        <CircleLoader />
      ) : (
        <AddOrEditSystemUser
          initialValues={initialValues}
          isPending={isPending}
          mutate={mutate}
          isForEdit={true}
        />
      )}
    </>
  );
};

export default EditSystemUser;
