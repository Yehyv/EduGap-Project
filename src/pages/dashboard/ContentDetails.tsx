import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import {
  instituteContentDetails,
  // contentActiveToggle,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import TopicsAndLessonsInContent from "@/features/Dashboard/components/TopicsAndLessonsInContent";
// import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";

// Types
interface Translation {
  name: string;
  description: string;
  whatToLearn: string;
}

interface ContentData {
  id: string;
  is_active: boolean;
  hasCertificate: boolean;
  image: string;
  level: string;
  category: {
    translations: Translation[];
  };
  translations: Translation[];
}

const ContentDetails = () => {
  const { contentId } = useParams();
  const [activeTab, setActiveTab] = useState<"data" | "topicsAndLessons">(
    "data",
  );

  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getContentDetails", contentId],
    queryFn: () => instituteContentDetails(contentId ?? ""),
    enabled: !!contentId,
  });

  const contentData: ContentData | undefined = data?.data;
  const contentDataAr = contentData?.translations?.[0];
  const contentDataEn = contentData?.translations?.[1];

  /* ================= LOADING & ERROR STATES ================= */
  if (isLoading) return <CircleLoader />;

  if (isError) {
    return (
      <ErrorMessage
        message={error?.message ?? "Error while fetching content details"}
      />
    );
  }

  if (!contentData) {
    return <ErrorMessage message="Content not found" />;
  }

  /* ================= TAB STYLING ================= */
  const tabClass = (tab: string) =>
    `rounded-lg border w-full py-2 px-4 cursor-pointer transition-all ${
      activeTab === tab
        ? "border-secondary text-secondary font-bold bg-secondary/5"
        : "border-[#9B9393] text-[#9B9393] hover:border-secondary/50"
    }`;

  return (
    <div className="space-y-5">
      {/* ================= HEADER ================= */}
      <DashboardPageTitle
        text="Training Course Details"
        button
        moreStyle="!from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5"
        buttonText={
          <Link
            to={`/dashboard/contents/edit/${contentData.id}`}
            className="flex items-center gap-2"
          >
            <EditIcon className="h-8" />
            <span className="text-secondary">Edit Training Course Data</span>
          </Link>
        }
      />

      {/* ================= STATUS BUTTON ================= */}
      {/* <div className="flex justify-end">
        <ActiveStatusButton
          isActive={contentData.is_active}
          itemId={contentId ?? ""}
          itemName="Training Course"
          activateApi={contentActiveToggle}
          deactivateApi={contentActiveToggle}
          refetchKey={["getContentDetails", contentId]}
          showModal={false}
        />
      </div> */}

      {/* ================= TABS ================= */}
      <div className="flex gap-4 mt-4">
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
          Training Course Data
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {activeTab === "data" && (
        <DataTabContent
          contentData={contentData}
          contentDataEn={contentDataEn}
          contentDataAr={contentDataAr}
        />
      )}

      {activeTab === "topicsAndLessons" && <TopicsAndLessonsInContent />}
    </div>
  );
};

/* ================= DATA TAB COMPONENT ================= */
interface DataTabContentProps {
  contentData: ContentData;
  contentDataEn?: Translation;
  contentDataAr?: Translation;
}

const DataTabContent = ({
  contentData,
  contentDataEn,
  contentDataAr,
}: DataTabContentProps) => {
  return (
    <div className="space-y-6">
      {/* English Data Section */}
      <ContentDataSection
        title="English Data"
        data={{
          "Content Name": contentDataEn?.name,
          Certificate: contentData?.hasCertificate ? "Yes" : "No",
          Description: contentDataEn?.description,
          Category: contentData?.category?.translations?.[1]?.name,
          Level: contentData?.level,
        }}
        image={contentData?.image}
        whatToLearn={contentDataEn?.whatToLearn}
      />

      {/* Arabic Data Section */}
      <ContentDataSection
        title="Arabic Data"
        data={{
          "Content Name": contentDataAr?.name,
          Description: contentDataAr?.description,
          Category: contentData?.category?.translations?.[0]?.name,
        }}
        whatToLearn={contentDataAr?.whatToLearn}
      />
    </div>
  );
};

/* ================= REUSABLE DATA SECTION COMPONENT ================= */
interface ContentDataSectionProps {
  title: string;
  data: Record<string, string | undefined>;
  image?: string;
  whatToLearn?: string;
}

const ContentDataSection = ({
  title,
  data,
  image,
  whatToLearn,
}: ContentDataSectionProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h4 className="text-lg font-semibold border-b pb-3 border-gray-200 mb-4">
        {title}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regular Data Fields */}
        {Object.entries(data).map(([key, value]) => (
          <DataField key={key} label={key} value={value} />
        ))}
        <div />
        {/* Image Field */}
        {image && (
          <div>
            <h6 className="text-sm font-bold text-gray-700 mb-3">
              Content Image
            </h6>
            <img
              className="max-h-64 rounded-xl shadow-md object-cover"
              src={image}
              alt="Content"
            />
          </div>
        )}

        {/* What To Learn Field */}
        {whatToLearn && (
          <div>
            <h6 className="text-sm font-bold text-gray-700 mb-2">
              What To Learn
            </h6>
            <ul className="list-disc ps-5 space-y-1">
              {whatToLearn.split(",").map((item, index) => (
                <li key={index} className="text-gray-600">
                  {item.trim()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= REUSABLE DATA FIELD COMPONENT ================= */
interface DataFieldProps {
  label: string;
  value?: string;
}

const DataField = ({ label, value }: DataFieldProps) => {
  return (
    <div>
      <h6 className="text-sm font-bold text-gray-700 mb-1">{label}</h6>
      <p className="text-gray-600">{value || "-"}</p>
    </div>
  );
};

export default ContentDetails;
