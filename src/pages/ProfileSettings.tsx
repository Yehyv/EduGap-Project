import SettingsIcon from "@/assets/svgs/SettingIcon.svg?react";
import BackButton from "@/shared/components/ui/BackButton";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useState } from "react";
import ChangePasswordFromProfile from "@/features/ProfileSettings/components/ChangePasswordFromProfile";
import ChangeProfileData from "@/features/ProfileSettings/components/ChangeProfileData";
import ProfileSettingsTabs from "@/features/ProfileSettings/components/ProfileSettingsTabs";
import ScrollToTop from "@/shared/utils/ScrollToTop";

const ProfileSettings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  return (
    <div className="container mt-5 mb-20 min-h-[80vh]">
      <ScrollToTop />
      <BackButton />

      <div className="flex items-center gap-2 mt-2">
        <SettingsIcon />
        <h2 className="text-2xl font-semibold">{t("profile_settings")}</h2>
      </div>

      <div className="flex max-md:flex-col gap-6 mt-6">
        {/* TABS */}
        <ProfileSettingsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* TAB CONTENT */}
        <div className="w-full rounded-xl shadow-custom py-5 px-10">
          {activeTab === "profile" && <ChangeProfileData />}

          {activeTab === "password" && <ChangePasswordFromProfile />}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
