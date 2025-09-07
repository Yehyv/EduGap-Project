import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import LoginBanner from "@/assets/svgs/loginBanner.svg?react";
import LightButton from "@/shared/components/ui/LightButton";
import MainLogo from "@/assets/svgs/MainLogo";
import withLoader from "@/shared/hooks/withLoader";
import { useLanguage } from "@/shared/localization/useLanguage";

const AuthLayout = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="grid max-sm:grid-cols-1 grid-cols-2 h-screen">
      <div className="max-sm:hidden container flex flex-col bg-primary py-10 h-screen overflow-hidden">
        <div>
          <h1>{t("welcome")}</h1>
          <h4 className="mt-3">
            تعلم في أي وقت، وطوّر مهاراتك لتكون جاهزًا لمستقبل أفضل
          </h4>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <LoginBanner className="w-full h-full object-contain" />
        </div>

        <LightButton text="اكمل ك زائر" onClick={() => navigate("/")} />
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

const AuthLayoutLogin = withLoader(AuthLayout);
export default AuthLayoutLogin;
