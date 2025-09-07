import AuthHeader from "@/features/auth/components/AuthHeader";
import VerifyOtpForm from "@/features/auth/components/VerifyOtpForm";
import { useLanguage } from "@/shared/localization/useLanguage";
const Login = () => {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeader headerTitle="تغيير كلمة المرور" />
      <h4>{t("change_password")}</h4>
      <VerifyOtpForm />
    </>
  );
};

export default Login;
