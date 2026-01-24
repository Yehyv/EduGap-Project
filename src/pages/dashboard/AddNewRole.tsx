import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createRole } from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditRole from "@/features/Dashboard/components/AddOrEditRole";

const AddNewRole = () => {
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
        title: "Success",
        text: "Role created successfully",
      });
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
      <DashboardPageTitle text="Add New Role" />
      <AddOrEditRole
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewRole;
