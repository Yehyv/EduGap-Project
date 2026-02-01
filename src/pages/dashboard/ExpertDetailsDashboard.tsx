import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { Link, useParams } from "react-router-dom";
import PencilIcon from "@/assets/svgs/PencilIcon.svg?react";
import AddIcon from "@/assets/svgs/PlusBlueIcon.svg?react";
import DeleteIcon from "@/assets/svgs/TrashIconDashboard.svg?react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExpertCoursesDashboard,
  getExpertDetailsForDashboard,
  unAssignContentFromExpert,
} from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import ErrorMessage from "@/shared/components/ErrorMessage";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import AddCourseToExpert from "@/features/Dashboard/components/AddCourseToExpert";
import { useState } from "react";
import Swal from "sweetalert2";

const ExpertDetailsDashboard = () => {
  const { expertId } = useParams();
  const { t } = useLanguage();
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const queryClient = useQueryClient();
  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["expertDetailsFroDashboard", expertId],
    queryFn: () => getExpertDetailsForDashboard(expertId ?? ""),
    enabled: !!expertId,
  });
  const {
    data: expertCoursesData,
    isLoading: expertCoursesDataLoading,
    isError: expertCoursesIsError,
    error: expertCoursesError,
  } = useQuery({
    queryKey: ["getExpertCourses", expertId],
    queryFn: () => getExpertCoursesDashboard(expertId ?? ""),
    enabled: !!expertId,
  });

  const expert = data?.data;
  const isActive = Boolean(expert?.is_active);

  const { mutate: deleteContent, isPending: isDeleting } = useMutation({
    mutationFn: unAssignContentFromExpert,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Content Unassigned successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["getExpertCourses"],
      });
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    },
  });

  const handleUnAssignCourseFromExpert = (contentId: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteContent(contentId);
      }
    });
  };

  if (isLoading) {
    return <CircleLoader />;
  }

  if (isError)
    return (
      <ErrorMessage
        message={error?.message ?? "Error While Fetching Expert Data"}
      />
    );

  return (
    <>
      <DashboardPageTitle
        text={t("expert")}
        button
        moreStyle="!from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5"
        buttonText={
          <Link to={`/dashboard/experts/edit/${expertId}`} className="center">
            <PencilIcon className="h-8 mx-2" />
            <span className="inline-block me-4 text-secondary">
              {t("edit_expert_data")}
            </span>
          </Link>
        }
      />

      {/* ================= STUDENT DATA ================= */}
      <div className="bg-white rounded-lg p-5 mt-3">
        <div className="flex justify-between border-b pb-2 mb-4 border-[#ACACAC]">
          <h5 className="text-secondary font-bold">{t("expert_data")}</h5>

          <button
            className={`px-6 py-1 rounded-full border font-medium text-sm relative ${
              isActive
                ? "border-green-500 text-green-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {isActive ? t("active") : t("inactive")}
            <span
              className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="text-[#444444] text-sm">{t("expert_name")}</h6>
            <p>{expert?.user.full_name || "-"}</p>
          </div>
          <div className="row-span-3">
            <h6 className="text-[#444444] text-sm mb-3">{t("expertImage")}</h6>
            {expert?.image && (
              <img
                className="max-h-50 rounded-2xl"
                src={expert.image}
                alt="expert"
              />
            )}
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("expert_bio")}</h6>
            <p>{expert?.bio || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("expert_title")}</h6>
            <p>{expert?.title || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("created_at")}</h6>
            <p>{expert?.created_at || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("created_by")}</h6>
            <p>{expert?.created_by || "-"}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsCourseModalOpen(true)}
        className="center border rounded-xl border-secondary ms-auto mt-4 py-1"
      >
        <AddIcon className="h-6" />
        <span className="inline-block me-4 text-secondary">
          Assign Content To Expert
        </span>
      </button>
      {/* ================= Expert Courses ================= */}
      <div className="bg-white rounded-lg px-3 py-1 mt-3">
        <div className="flex justify-between border-b border-[#ACACAC] py-2">
          <h5 className="text-secondary font-bold">Expert Training Courses </h5>
        </div>
        {expertCoursesIsError && (
          <p className="text-gray-400 text-center mt-4">
            {expertCoursesError.message}
          </p>
        )}
        {expertCoursesData?.data?.length == 0 && (
          <p className="text-gray-400 text-center mt-4">
            No Courses Available{" "}
          </p>
        )}
        {expertCoursesDataLoading ? (
          <CircleLoader />
        ) : (
          <div className="py-4">
            {expertCoursesData?.data.map((d, index) => (
              <div className="flex justify-between mb-4">
                <div>
                  <span>{index + 1} - </span>
                  <span>{d.name}</span>
                </div>
                <button onClick={() => handleUnAssignCourseFromExpert(d.id)}>
                  <DeleteIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddCourseToExpert
        reviewModalOpen={isCourseModalOpen}
        setReviewModalOpen={setIsCourseModalOpen}
      />
    </>
  );
};

export default ExpertDetailsDashboard;
