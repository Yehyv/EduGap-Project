import type { TabType } from "./types";

interface ProgramTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  coursesCount: number;
  institutesCount: number;
}

const ProgramTabs = ({
  activeTab,
  onTabChange,
  coursesCount,
  institutesCount,
}: ProgramTabsProps) => {
  const tabClass = (tab: TabType) =>
    `rounded-lg border flex-1 py-2.5 px-4 cursor-pointer transition-all font-medium ${
      activeTab === tab
        ? "border-none text-secondary bg-secondary/5 shadow-sm"
        : "border-gray-300 border text-gray-600 hover:text-secondary/70"
    }`;

  return (
    <div className="flex gap-4 mt-4 max-sm:flex-col">
      <button
        className={tabClass("information")}
        onClick={() => onTabChange("information")}
      >
        Information
      </button>

      <button
        className={tabClass("courses")}
        onClick={() => onTabChange("courses")}
      >
        Courses ({coursesCount})
      </button>

      <button
        className={tabClass("institutes")}
        onClick={() => onTabChange("institutes")}
      >
        Institutes ({institutesCount})
      </button>
    </div>
  );
};

export default ProgramTabs;
