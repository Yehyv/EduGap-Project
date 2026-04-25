import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editStudent,
  getStudentDetails,
} from "@/features/Dashboard/services/dashboardApis";

import { useMutation, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import AddOrEditStudent from "@/features/Dashboard/components/AddOrEditStudent";

const EditStudentInInstitute = () => {
  const { studentId } = useParams();
  const { data: getStudentData, isLoading } = useQuery({
    queryKey: ["studentDetails", studentId],
    queryFn: () => getStudentDetails(studentId ?? ""),
  });
  const currentUserData = getStudentData?.data;

  const initialValues = {
    full_name: currentUserData?.full_name,
    email: currentUserData?.email,
    national_id: currentUserData?.username,
    phone_key: currentUserData?.phone_key,
    programId: currentUserData?.program_id,
    phone: currentUserData?.phone,
    studentId: currentUserData?.studentId, // the created student id by user
    student_id: +studentId, // user Id to update
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
          isForEdit
        />
      )}
    </>
  );
};

export default EditStudentInInstitute;
