import AuthHeader from "@/features/auth/components/AuthHeader";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <>
      <AuthHeader headerTitle="تغيير كلمة المرور" />
      <ForgotPasswordForm />
    </>
  );
};

export default ForgotPassword;
