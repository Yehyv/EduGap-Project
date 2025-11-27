import { useLanguage } from "@/shared/localization/useLanguage";
import type { Dispatch, SetStateAction } from "react";

type TabType = "profile" | "password";

const ProfileSettingsTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabType;
  setActiveTab: Dispatch<SetStateAction<TabType>>;
}) => {
  const { t } = useLanguage();

  return (
    <div className="md:w-[25%]">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setActiveTab("profile")}
          className={`cursor-pointer border-b py-2 px-4 font-bold transition
                ${
                  activeTab === "profile"
                    ? "bg-gradient-to-t from-[#ECF8FF] to-white border-secondary"
                    : "text-[#797979]"
                }`}
        >
          {t("personal_data")}
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className={`border-b cursor-pointer py-2 px-4 font-bold transition
                ${
                  activeTab === "password"
                    ? "bg-gradient-to-t from-[#ECF8FF] to-white border-secondary"
                    : "text-[#797979]"
                }`}
        >
          {t("change_password")}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettingsTabs;
