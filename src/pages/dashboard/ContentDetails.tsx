import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import { instituteContentDetails } from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import TopicsAndLessonsInContent from "@/features/Dashboard/components/TopicsAndLessonsInContent";

const ContentDetails = () => {
  const { contentId } = useParams();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("data");

  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getContentDetails", contentId],
    queryFn: () => instituteContentDetails(contentId ?? ""),
    enabled: !!contentId,
  });

  const contentData = data?.data;

  if (isLoading) return <CircleLoader />;
  if (isError)
    return (
      <ErrorMessage
        message={error?.message ?? "Error while fetching content details"}
      />
    );

  const tabClass = (tab: string) =>
    `rounded-lg border w-full py-1 cursor-pointer ${
      activeTab === tab
        ? "border-secondary text-secondary font-bold"
        : "border-[#9B9393] text-[#9B9393]"
    }`;

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-1">
        <h2 className="mb-5">Training Course Details</h2>

        <div className="flex items-center gap-2">
          <button
            className={`px-6 py-1 text-nowrap rounded-full border font-medium text-sm relative ${
              contentData?.is_active
                ? "border-green-500 text-green-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {contentData?.is_active ? t("active") : t("inactive")}
            <span
              className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 ${
                contentData?.is_active ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </button>

          <Link
            to={`/dashboard/contents/edit/${contentData?.id}`}
            className="bg-gradient-to-r from-[#F6F6F6] to-[#F6F6F6] border border-secondary py-0.5 px-4 rounded-xl shadow-md flex items-center"
          >
            <EditIcon className="h-8 mx-2" />
            <span className="text-secondary">Edit Training Course Data</span>
          </Link>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-4 my-5">
        <button
          className={tabClass("topicsAndLessons")}
          onClick={() => setActiveTab("topicsAndLessons")}
        >
          Topics & Lessons
        </button>

        <button
          className={tabClass("data")}
          onClick={() => setActiveTab("data")}
        >
          Training Courses Data
        </button>
      </div>

      {/* ================= DATA TAB ================= */}
      {activeTab === "data" && (
        <>
          <div className="bg-white p-5 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="text-sm font-bold">Content Name</h6>
                <p>{contentData?.name}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">Certificate</h6>
                <p>{contentData?.hasCertificate ?? "-"}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">Description</h6>
                <p>{contentData?.description}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">Category</h6>
                <p>{contentData?.categoryName}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">Level</h6>
                <p>{contentData?.level}</p>
              </div>
              <div></div>

              <div>
                <h6 className="text-sm font-bold mb-3">Content Image</h6>
                {contentData?.image && (
                  <img
                    className="max-h-50 rounded-2xl"
                    src={contentData.image}
                    alt="Institute Logo"
                  />
                )}
              </div>

              <div>
                <h6 className="text-sm font-bold">What To Learn</h6>
                <ul className="list-disc ps-5">
                  {contentData?.whatToLearn.split(",").map((c) => (
                    <li>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= OTHER TABS ================= */}
      {activeTab === "topicsAndLessons" && <TopicsAndLessonsInContent />}
    </>
  );
};

export default ContentDetails;
