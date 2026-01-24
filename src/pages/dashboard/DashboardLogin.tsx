import AuthHeader from "@/features/auth/components/AuthHeader";
import DashboardLoginForm from "@/features/auth/components/DashboardLoginForm";
import { useLanguage } from "@/shared/localization/useLanguage";
const DashboardLogin = () => {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeader headerTitle={t("login_dashboard_title")} />
      <DashboardLoginForm />
    </>
  );
};

export default DashboardLogin;
