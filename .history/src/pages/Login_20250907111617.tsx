import AuthHeader from "@/features/auth/components/AuthHeader";
import LoginForm from "@/features/auth/components/LoginForm";
import { useLanguage } from "@/shared/localization/useLanguage";
const Login = () => {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeader headerTitle={t("login_title")} />
      <LoginForm />
    </>
  );
};

export default Login;
