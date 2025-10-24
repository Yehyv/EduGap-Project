import AuthHeader from "@/features/auth/components/AuthHeader";
import VerifyOtpForm from "@/features/auth/components/VerifyOtpForm";
import { useLanguage } from "@/shared/localization/useLanguage";
const Login = () => {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeader headerTitle={t("verify_otp")} />
      <h4>{t("otp_title")}</h4>
      <VerifyOtpForm />
    </>
  );
};

export default Login;
