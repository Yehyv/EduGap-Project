import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { createStudent } from "@/features/Dashboard/services/dashboardApis";

import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditStudent from "@/features/Dashboard/components/AddOrEditStudent";

const AddNewStudent = () => {
  const initialValues = {
    full_name: "",
    email: "",
    national_id: "",
    phone_key: "",
    phone: "",
    instituteId: "",
  };
  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: createStudent,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Student added successfully",
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
      <DashboardPageTitle text="Add New Student" />
      <AddOrEditStudent
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewStudent;
