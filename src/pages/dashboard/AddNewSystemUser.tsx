import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createSystemUser } from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditSystemUser from "@/features/Dashboard/components/AddOrEditSystemUser";

const AddNewSystemUser = () => {
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
        title: "Success",
        text: "User created successfully",
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
      <DashboardPageTitle text="Add New System User" />
      <AddOrEditSystemUser
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewSystemUser;
