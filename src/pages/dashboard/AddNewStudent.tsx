import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createStudent } from "@/features/Dashboard/services/dashboardApis";

import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditStudent from "@/features/Dashboard/components/AddOrEditUser";

const AddNewStudent = () => {
  const initialValues = {
    full_name: "",
    email: "",
    national_id: "",
    phone_key: "20",
    phone: "",
    instituteId: "",
    roleId: "",
  };
  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: createStudent,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data Submited successfully",
      });
    },

    onError: (error) => {
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
      <DashboardPageTitle text="Add New User" />
      <AddOrEditStudent
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewStudent;
