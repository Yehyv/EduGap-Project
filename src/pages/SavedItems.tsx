import { useState } from "react";
import SavedContentsPagination from "@/features/SavedIrems/components/SavedContentsPagination";
import SavedCoursesPagination from "@/features/SavedIrems/components/SavedCoursesPagination";
import SavedProgramsPagination from "@/features/SavedIrems/components/SavedProgramsPagination";
import SmoothLazy from "@/shared/components/SmoothLazy";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useNavigate } from "react-router-dom";

const SavedIcon = SmoothLazy(
  () => import("@/assets/svgs/SaveIconWhite.svg?react"),
  "w-7 h-7"
);
const ReturnIcon = SmoothLazy(
  () => import("@/assets/svgs/ReturnIcon.svg?react"),
  "w-7 h-7"
);

type TabKey = "courses" | "programs" | "contents";

const SavedItems = () => {
  const { t, lang } = useLanguage();
  const TABS: { key: TabKey; label: string }[] = [
    { key: "courses", label: t("saved_courses") },
    { key: "programs", label: t("programs") },
    { key: "contents", label: t("saved_contents") },
  ];
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("courses");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "courses":
        return <SavedCoursesPagination />;
      case "programs":
        return <SavedProgramsPagination />;
      case "contents":
        return <SavedContentsPagination />;
      default:
        return null;
    }
  };

  return (
    <div className="container mt-5">
      {/* Back Button */}
      <button
        className={`cursor-pointer ${lang === "ar" ? "" : "rotate-180"}`}
        onClick={() => navigate(-1)}
      >
        <ReturnIcon />
      </button>

      {/* Title */}
      <div className="flex items-center gap-2 mt-2">
        <SavedIcon />
        <h4 className="text-lg font-semibold">{t("saved_items")}</h4>
      </div>

      {/* Tabs */}
      <div className="flex max-md:flex-col justify-center gap-4 mt-6 text-[#9E9C9C]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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

export default SavedItems;
