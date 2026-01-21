import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editCity,
  findCity,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import AddOrEditCity from "@/features/Dashboard/components/AddOrEditCity";

const EditCity = () => {
  const { cityId } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["findOneCity"],
    queryFn: () => findCity(cityId ?? ""),
  });
  const queryClient = useQueryClient();

  const initialValues = {
    cityId: cityId,
    translations: [
      {
        name: data?.data?.name,
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
    mutationFn: editCity,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "City created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["findOneCity"] });
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
  const cityName = data?.data?.name;

  if (isLoading) return <CircleLoader />;
  return (
    <>
      <DashboardPageTitle text={`Edit City ${cityName}`} />
      <AddOrEditCity
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
      />
    </>
  );
};

export default EditCity;
