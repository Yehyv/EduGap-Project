import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { Link, useParams } from "react-router-dom";
import PencilIcon from "@/assets/svgs/PencilIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusSign.svg?react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudentDetails,
  activateStudent,
  deactivateStudent,
} from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import ErrorMessage from "@/shared/components/ErrorMessage";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import AddProgramToStudent from "@/features/Dashboard/components/AddProgramToStudent";
import StudentStatusModal from "@/features/Dashboard/components/StudentStatusModal";
import { useState } from "react";
import Swal from "sweetalert2";

const StudentDetails = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const { studentId } = useParams();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["studentDetails", studentId],
    queryFn: () => getStudentDetails(studentId ?? ""),
    enabled: !!studentId,
  });

  /* ================= MUTATIONS ================= */
  const activateMutation = useMutation({
    mutationFn: (reason: string) =>
      activateStudent(studentId ?? "", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studentDetails", studentId],
      });
      setStatusModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Student activated successfully",
        confirmButtonColor: "#10b981",
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to activate student",
        confirmButtonColor: "#ef4444",
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (reason: string) =>
      deactivateStudent(studentId ?? "", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studentDetails", studentId],
      });
      setStatusModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Student deactivated successfully",
        confirmButtonColor: "#10b981",
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to deactivate student",
        confirmButtonColor: "#ef4444",
      });
    },
  });

  const student = data?.data;
  const isActive = Boolean(student?.isActive);

  /* ================= HANDLERS ================= */
  const handleToggleStatus = () => {
    if (isActive) {
      setIsActivating(false);
      setStatusModalOpen(true);
    } else {
      setIsActivating(true);
      setStatusModalOpen(true);
    }
  };

  const handleStatusChange = (reason: string) => {
    if (isActivating) {
      activateMutation.mutate(reason);
    } else {
      deactivateMutation.mutate(reason);
    }
  };

  if (isLoading) {
    return <CircleLoader />;
  }

  if (isError)
    return (
      <ErrorMessage
        message={error?.message ?? "Error While Fetching Student Data"}
      />
    );

  return (
    <>
      <DashboardPageTitle
        text={`${student?.full_name ?? ""}`}
        button
        moreStyle="!from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5"
        buttonText={
          <Link to={`/dashboard/users/edit/${studentId}`} className="center">
            <PencilIcon className="h-8 mx-2" />
            <span className="inline-block me-4 text-secondary">
              {t("edit_student_data")}
            </span>
          </Link>
        }
      />

      {/* ================= STUDENT DATA ================= */}
      <div className="bg-white rounded-lg p-5 mt-3">
        <div className="flex justify-between">
          <h5 className="text-secondary font-bold">{t("student_data")}</h5>

          <button
            onClick={handleToggleStatus}
            disabled={
              activateMutation.isPending || deactivateMutation.isPending
            }
            className={`px-6 py-1 rounded-full border font-medium text-sm relative transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive
                ? "border-green-500 text-green-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {activateMutation.isPending || deactivateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              <>
                {isActive ? "Active" : "Inactive"}
                <span
                  className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
                    isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="text-[#444444] text-sm">{t("student_name")}</h6>
            <p>{student?.full_name || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("institute")}</h6>
            <p>{student?.institute?.name || "-"}</p>
          </div>
          <div>
            <h6 className="text-[#444444] text-sm">Student Program</h6>
            <p>{student?.program || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("email")}</h6>
            <p>{student?.email || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("phone")}</h6>
            <p>{student?.phone || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm mb-3">
              {t("student_image")}
            </h6>
            {student?.user_image && (
              <img
                className="max-h-50 rounded-2xl"
                src={student.user_image}
                alt="student"
              />
            )}
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("created_at")}</h6>
            <p>{student?.createdAt || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("created_by")}</h6>
            <p>{student?.createdBy || "-"}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="center my-4 ms-auto bg-gradient-to-r cursor-pointer center py-1.5 from-[#FCB737] to-[#BB831A] text-white px-2 rounded-xl shadow-md hover:to-[#FCB737] transition"
      >
        <PlusIcon className="h-6 mx-0" />
        <span className="inline-block me-2 text-white text-sm">
          Assign Student to program
        </span>
      </button>

      <AddProgramToStudent
        instituteId={student?.institute?.id}
        reviewModalOpen={modalOpen}
        setReviewModalOpen={setModalOpen}
      />

      <StudentStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onSubmit={handleStatusChange}
        isLoading={activateMutation.isPending || deactivateMutation.isPending}
        isActivating={isActivating}
      />
    </>
  );
};

export default StudentDetails;
