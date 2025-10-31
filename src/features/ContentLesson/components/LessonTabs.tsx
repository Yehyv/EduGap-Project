import { useLanguage } from "@/shared/localization/useLanguage";

type TabKey = "comments" | "attachments" | "notes";

type Props = {
  activeTab: TabKey;
  setActiveTab: (v: TabKey) => void;
};

const LessonTabs = ({ activeTab, setActiveTab }: Props) => {
  const { t } = useLanguage();

  const tabs: { key: TabKey; label: string }[] = [
    { key: "comments", label: t("comments") },
    { key: "attachments", label: t("attachments") },
    { key: "notes", label: t("notes") },
  ];

  return (
    <div className="grid grid-cols-3 mt-4 gap-2 bg-[#F5F5F5] p-2 rounded-3xl">
      {tabs.map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              rounded-3xl py-2 text-center transition font-medium 
              outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer
              ${
                isActive
                  ? "bg-white shadow-md text-black"
                  : "text-gray-600 hover:bg-white/70"
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default LessonTabs;
