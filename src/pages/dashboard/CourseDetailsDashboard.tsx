import { Link, useParams } from "react-router-dom";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import PlusBlueIcon from "@/assets/svgs/PlusBlueIcon.svg?react";
import { courseDetailsForDashboard } from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useState } from "react";
import AssignContentToCourse from "@/features/Dashboard/components/AssignContentToCourse";

const CourseDetailsDashboard = () => {
  const { courseId } = useParams();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("data");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["courseDetailsForDashboard", courseId],
    queryFn: () => courseDetailsForDashboard(courseId ?? ""),
    enabled: !!courseId,
  });

  const courseData = data?.data;

  if (isLoading) return <CircleLoader />;
  if (isError)
    return <ErrorMessage message={error?.message ?? t("courseTitle")} />;

  const tabClass = (tab) =>
    `rounded-lg border w-full py-1 cursor-pointer ${
      activeTab === tab
        ? "border-secondary text-secondary font-bold"
        : "border-[#9B9393] text-[#9B9393]"
    }`;

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-1 ">
        <h2 className="mb-5">{t("courseTitle")}</h2>
        <div className="flex items-center gap-2">
          <button
            className={`px-6 py-1 rounded-full border font-medium text-sm relative ${
              courseData?.isActive
                ? "border-green-500 text-green-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {courseData?.isActive ? t("courseActive") : t("courseInactive")}
            <span
              className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
                courseData?.isActive ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
          </button>
          <Link
            to={`/dashboard-edit-course/${courseData?.id}`}
            className="bg-gradient-to-r cursor-pointer !from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5 text-white px-4 rounded-xl shadow-md flex items-center"
          >
            <EditIcon className="h-8 mx-2" />
            <span className="inline-block me-4 text-secondary">
              {t("editCourse")}
            </span>
          </Link>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-10 text-[#9B9393] my-5">
        <button
          className={tabClass("data")}
          onClick={() => setActiveTab("data")}
        >
          {t("tabCourseData")}
        </button>
        <button
          className={tabClass("sessions")}
          onClick={() => setActiveTab("sessions")}
        >
          {t("tabCourseSessions")}
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {activeTab === "data" && (
        <div className="bg-white rounded-lg p-5 mt-3">
          <div className="flex justify-between border-b border-[#ACACAC] pb-3 mb-4">
            <h5 className="text-secondary font-bold">{t("courseDataTitle")}</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h6 className="text-[#444444] text-sm font-bold">
                {t("fieldName")}
              </h6>
              <p>{courseData?.name}</p>
            </div>

            <div className="row-span-2">
              <h6 className="text-[#444444] text-sm mb-3 font-bold">
                {t("fieldImage")}
              </h6>
              {courseData?.image && (
                <img
                  className="max-h-30 rounded-2xl"
                  src={courseData?.image}
                  alt={t("fieldImage")}
                />
              )}
            </div>

            <div>
              <h6 className="text-[#444444] text-sm font-bold">
                {t("fieldDescription")}
              </h6>
              <p>{courseData?.description}</p>
            </div>

            <div className="col-span-2">
              <h6 className="text-[#444444] text-sm font-bold">
                {t("fieldWhatToLearn")}
              </h6>
              <ul className="list-disc ps-4">
                {courseData?.whatToLearn?.split(",").map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            <div>
              <h6 className="text-[#444444] text-sm font-bold">
                {t("fieldCreatedAt")}
              </h6>
              <p>{courseData?.createdAt ?? "-"}</p>
            </div>

            <div>
              <h6 className="text-[#444444] text-sm font-bold">
                {t("fieldCreatedBy")}
              </h6>
              <p>{courseData?.createdBy ?? "-"}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <>
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setReviewModalOpen(true)}
              className="center text-secondary font-bold"
            >
              <span>اضافة دورة تدريبية جديدة</span>
              <PlusBlueIcon className="h-7" />
            </button>
            <p>الدورات التدريبية الخاصة بالمقرر (3)</p>
          </div>
          <div className="bg-white p-5 rounded-lg"></div>
          <AssignContentToCourse
            courseId={courseId}
            reviewModalOpen={reviewModalOpen}
            setReviewModalOpen={setReviewModalOpen}
          />
        </>
      )}
    </>
  );
};

export default CourseDetailsDashboard;
