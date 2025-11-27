import { useState, useEffect } from "react";
import SmoothLazy from "@/shared/components/SmoothLazy";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useSearchParams } from "react-router-dom";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CurrentCoursesPagination from "@/features/myCourses/components/CoursesPagination";
import BackButton from "@/shared/components/ui/BackButton";
import {
  getMyCompletedCourses,
  getMyCurrentCourses,
} from "@/features/myCourses/services/myCoursesApis";

const ComputerIcon = SmoothLazy(
  () => import("@/assets/svgs/ComputerIcon.svg?react"),
  "w-7 h-7"
);

type TabKey = "current" | "finished";

const MyCourses = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const TABS: { key: TabKey; label: string }[] = [
    { key: "current", label: t("current_courses") },
    { key: "finished", label: t("finished_courses") },
  ];

  const tabFromUrl = searchParams.get("tab") as TabKey | null;

  const [activeTab, setActiveTab] = useState<TabKey>(
    tabFromUrl && TABS.some((t) => t.key === tabFromUrl)
      ? tabFromUrl
      : "current"
  );

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "current":
        return (
          <CurrentCoursesPagination
            queryFunc={getMyCurrentCourses}
            queryKey={"currentCourses"}
          />
        );
      case "finished":
        return (
          <CurrentCoursesPagination
            queryFunc={getMyCompletedCourses}
            queryKey={"completedCourses"}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mt-5">
      <ScrollToTop />
      <BackButton />
      {/* Title */}
      <div className="flex items-center gap-2 mt-2">
        <ComputerIcon />
        <h2 className="text-2xl font-semibold">{t("my_courses")}</h2>
      </div>

      {/* Tabs */}
      <div className="flex max-md:flex-col justify-center max-md:gap-4 gap-10 mt-6 text-[#9E9C9C]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-10 py-2 w-full border rounded-md transition-all cursor-pointer
              ${
                activeTab === tab.key
                  ? "bg-primary text-secondary font-semibold border-secondary"
                  : "border-[#9E9C9C] hover:bg-gray-100"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Content */}
      <div className="mt-6">{renderActiveComponent()}</div>
    </div>
  );
};

export default MyCourses;
