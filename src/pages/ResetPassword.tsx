import AuthHeader from "@/features/auth/components/AuthHeader";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import { useLanguage } from "@/shared/localization/useLanguage";

const ResetPassword = () => {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeader headerTitle={t("reset_password")} />
      <ResetPasswordForm />
    </>
  );
};

export default ResetPassword;
