import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editStudent,
  getStudentDetails,
} from "@/features/Dashboard/services/dashboardApis";

import { useMutation, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditStudent from "@/features/Dashboard/components/AddOrEditStudent";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";

const EditStudentData = () => {
  const { studentId } = useParams();
  const { data: getStudentData, isLoading } = useQuery({
    queryKey: ["studentDetails", studentId],
    queryFn: () => getStudentDetails(studentId ?? ""),
  });
  const currentUserData = getStudentData?.data;

  const initialValues = {
    full_name: currentUserData?.full_name,
    email: currentUserData?.email,
    national_id: currentUserData?.national_id,
    phone_key: currentUserData?.phone_key,
    phone: currentUserData?.phone,
    instituteId: currentUserData?.institute.id,
    studentId: studentId,
  };
  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: editStudent,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Student edited successfully",
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
      <DashboardPageTitle text="Edit Student Data" />
      {isLoading && <CircleLoader />}
      {!isLoading && (
        <AddOrEditStudent
          initialValues={initialValues}
          isPending={isPending}
          mutate={mutate}
        />
      )}
    </>
  );
};

export default EditStudentData;
