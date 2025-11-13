import AuthHeader from "@/features/auth/components/AuthHeader";
import ChangePasswordForm from "@/features/auth/components/ChangePasswordForm";
import { useLanguage } from "@/shared/localization/useLanguage";

const ChangePassword = () => {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeader headerTitle={t("change_password")} />
      <ChangePasswordForm />
    </>
  );
};

export default ChangePassword;
