import { Outlet } from "react-router-dom";
import LoginBanner from "@/assets/svgs/DashboardLoginBanner.svg?react";
import MainLogo from "@/assets/svgs/MainLogo";
import withLoader from "@/shared/hooks/withLoader";
import { useLanguage } from "@/shared/localization/useLanguage";

const AuthDashboardLayout = () => {
  const { t } = useLanguage();

  return (
    <div className="grid max-sm:grid-cols-1 grid-cols-2 h-screen">
      <div className="max-sm:hidden container flex flex-col bg-primary py-10 h-screen overflow-hidden">
        <div>
          <h1>{t("welcome")}</h1>
          <h4 className="mt-3">{t("dashboard")} </h4>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <LoginBanner className="w-full h-full object-contain" />
        </div>
      </div>

      <div className="container h-screen flex flex-col items-center">
        <div className="center flex-col mt-10">
          <MainLogo />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

const AuthDashboardLoginLayout = withLoader(AuthDashboardLayout);
export default AuthDashboardLoginLayout;
