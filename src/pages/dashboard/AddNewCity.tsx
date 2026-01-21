import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  createCity,
  createCountry,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditCity from "@/features/Dashboard/components/AddOrEditCity";

const AddNewCity = () => {
  const initialValues = {
    countryId: "",
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
    mutationFn: createCity,

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
      <DashboardPageTitle text="Add New City" />
      <AddOrEditCity
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default AddNewCity;
