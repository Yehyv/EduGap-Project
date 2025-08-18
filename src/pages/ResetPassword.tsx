import AuthHeader from "@/features/auth/components/AuthHeader";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

const ResetPassword = () => {
  return (
    <>
      <AuthHeader headerTitle="إعادة تعيين كلمة المرور" />
      <ResetPasswordForm />
    </>
  );
};

export default ResetPassword;
