import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  createCity,
  createRegion,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditRegion from "@/features/Dashboard/components/AddOrEditRegion";

const AddNewRegion = () => {
  const initialValues = {
    cityId: "",
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
    mutationFn: createRegion,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "City created successfully",
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
      <DashboardPageTitle text="Add New Region" />
      <AddOrEditRegion
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewRegion;
