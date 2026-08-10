import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  editStudent,
  getStudentDetails,
} from "@/features/Dashboard/services/dashboardApis";

import { useMutation, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AddOrEditStudent from "@/features/Dashboard/components/AddOrEditUser";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import { useLanguage } from "@/shared/localization/useLanguage";

const EditUserData = () => {
  const { t } = useLanguage();
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
    phone: currentUserData?.phone,
    student_id: +studentId,
  };
  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: editStudent,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("user_upadting_success"),
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
      <DashboardPageTitle text={t("edit_user_data")} />
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

export default EditUserData;
