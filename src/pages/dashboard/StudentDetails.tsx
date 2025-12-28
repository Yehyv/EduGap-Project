import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { Link, useParams } from "react-router-dom";
import PencilIcon from "@/assets/svgs/PencilIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusSign.svg?react";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import TrashIcon from "@/assets/svgs/TrashIconDashboard.svg?react";
import { useQuery } from "@tanstack/react-query";
import { getStudentDetails } from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import ErrorMessage from "@/shared/components/ErrorMessage";
import CircleLoader from "@/shared/components/ui/CircleLoader";

const StudentDetails = () => {
  const { studentId } = useParams();
  const { t } = useLanguage();

  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["studentDetails", studentId],
    queryFn: () => getStudentDetails(studentId ?? ""),
    enabled: !!studentId,
  });

  const student = data?.data;
  const isActive = Boolean(student?.is_active);

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
        text={t("students")}
        button
        moreStyle="!from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5"
        buttonText={
          <Link to={`/edit-student/${studentId}`} className="center">
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
            <h6 className="text-[#444444] text-sm">{t("student_name")}</h6>
            <p>{student?.full_name || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("institute")}</h6>
            <p>{student?.institute?.name || "-"}</p>
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

          <div />

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

      {/* ================= STUDENT PROGRAM ================= */}
      <div className="bg-white rounded-lg px-3 py-1 mt-3">
        <div className="flex justify-between border-b border-[#ACACAC] py-2">
          <h5 className="text-secondary font-bold">{t("student_program")}</h5>

          <button
            type="button"
            className="bg-gradient-to-r cursor-pointer center py-1.5 from-[#FCB737] to-[#BB831A] text-white px-2 rounded-xl shadow-md hover:to-[#FCB737] transition"
          >
            <Link to="#" className="center">
              <PlusIcon className="h-6 mx-0" />
              <span className="inline-block me-2 text-white text-sm">
                {t("add_student_program")}
              </span>
            </Link>
          </button>
        </div>

        {/* Change this Static Data */}
        <div className="flex justify-between py-4">
          <div>
            <span className="me-1">1-</span>
            <span>-</span>
          </div>

          <div>
            <button>
              <EditIcon className="inline-block mx-2" />
            </button>
            <button>
              <TrashIcon className="inline-block" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDetails;
