import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  createCountry,
  editCountry,
  findCountry,
} from "@/features/Dashboard/services/dashboardApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditCountry from "@/features/Dashboard/components/AddOrEditCountry";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";

const EditCountry = () => {
  const { countryId } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["findOneCountry"],
    queryFn: () => findCountry(countryId ?? ""),
  });
  const queryClient = useQueryClient();

  const initialValues = {
    countryId: countryId,
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
    mutationFn: editCountry,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Country created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["findOneCountry"] });
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
  const countryName = data?.data?.name;

  if (isLoading) return <CircleLoader />;
  return (
    <>
      <DashboardPageTitle text={`Edit Country ${countryName}`} />
      <AddOrEditCountry
        initialValues={initialValues}
        isPending={isPending}
        mutate={mutate}
        isForEdit={true}
      />
    </>
  );
};

export default EditCountry;
