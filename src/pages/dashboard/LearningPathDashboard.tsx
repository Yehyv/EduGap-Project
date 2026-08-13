import { Link, useParams } from "react-router-dom";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import { learningPathForDashboard } from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useState } from "react";
import ContentsInLearningPath from "@/features/Dashboard/components/ContentsInLearningPath";

const LearningPathDashboard = () => {
  const { learningPathId } = useParams();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("data");

  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["learningPathForDashboard", learningPathId],
    queryFn: () => learningPathForDashboard(learningPathId ?? ""),
    enabled: !!learningPathId,
  });

  const learningPathData = data?.data;
  const learningPathDataAr = data?.data?.translations[0];
  const learningPathDataEn = data?.data?.translations[1];

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
        <h2 className="mb-5">{t("learningPath")}</h2>

        <div className="flex items-center gap-2">
          <button
            className={`px-6 py-1 rounded-full border font-medium text-sm relative ${
              learningPathData?.isActive
                ? "border-green-500 text-green-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {learningPathData?.isActive
              ? t("courseActive")
              : t("courseInactive")}

            <span
              className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
                learningPathData?.isActive ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
          </button>

          <Link
            to={`/dashboard/learning-paths/edit/${learningPathData?.id}`}
            className="bg-gradient-to-r cursor-pointer !from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5 text-white px-4 rounded-xl shadow-md flex items-center"
          >
            <EditIcon className="h-8 mx-2" />

            <span className="inline-block me-4 text-secondary">
              {t("editLearningPath")}
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
          {t("learningPathDataTab")}
        </button>

        <button
          className={tabClass("sessions")}
          onClick={() => setActiveTab("sessions")}
        >
          {t("learningPathCoursesTab")}
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {activeTab === "data" && (
        <>
          <div className="bg-white rounded-lg p-5 mt-3">
            <div className="flex justify-between border-b border-[#ACACAC] pb-3 mb-4">
              <h5 className="text-secondary font-bold">
                {t("learningDataTitle")}
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="text-[#444444] text-sm font-bold">
                  {t("learningPathName")}
                </h6>

                <p>{learningPathDataEn?.title}</p>
              </div>

              <div className="row-span-2">
                <h6 className="text-[#444444] text-sm mb-3 font-bold">
                  {t("learningPathImage")}
                </h6>

                {learningPathData?.image && (
                  <img
                    className="max-h-30 rounded-2xl"
                    src={learningPathData?.image}
                    alt={t("fieldImage")}
                  />
                )}
              </div>

              <div>
                <h6 className="text-[#444444] text-sm font-bold">
                  {t("fieldDescription")}
                </h6>

                <p>{learningPathDataEn?.description}</p>
              </div>

              <div className="col-span-2">
                <h6 className="text-[#444444] text-sm font-bold">
                  {t("fieldWhatToLearn")}
                </h6>

                <ul className="list-disc ps-4">
                  {learningPathDataEn?.learning_outcoms
                    ?.split(",")
                    .map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                </ul>
              </div>

              <div>
                <h6 className="text-[#444444] text-sm font-bold">
                  {t("fieldCreatedAt")}
                </h6>

                <p>{learningPathData?.createdAt ?? "-"}</p>
              </div>

              <div>
                <h6 className="text-[#444444] text-sm font-bold">
                  {t("fieldCreatedBy")}
                </h6>

                <p>{learningPathData?.createdBy?.name ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 mt-3">
            <div className="flex justify-between border-b border-[#ACACAC] pb-3 mb-4">
              <h5 className="text-secondary font-bold">
                {t("learningDataTitle")} ({t("arabic")})
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="text-[#444444] text-sm font-bold">
                  {t("learningPathName")}
                </h6>

                <p>{learningPathDataAr?.title}</p>
              </div>

              <div>
                <h6 className="text-[#444444] text-sm font-bold">
                  {t("fieldDescription")}
                </h6>

                <p>{learningPathDataAr?.description}</p>
              </div>

              <div className="col-span-2">
                <h6 className="text-[#444444] text-sm font-bold">
                  {t("fieldWhatToLearn")}
                </h6>

                <ul className="list-disc ps-4">
                  {learningPathDataAr?.learning_outcoms
                    ?.split(",")
                    .map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "sessions" && <ContentsInLearningPath />}
    </>
  );
};

export default LearningPathDashboard;
