import { motion } from "framer-motion";
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
            className="relative rounded-3xl py-2 text-center font-medium cursor-pointer overflow-hidden"
          >
            {isActive && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-white shadow-md rounded-3xl"
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              />
            )}

            <span
              className={`relative z-10 ${
                isActive ? "text-black" : "text-gray-600"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default LessonTabs;
