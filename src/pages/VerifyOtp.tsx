import AuthHeader from "@/features/auth/components/AuthHeader";
import VerifyOtpForm from "@/features/auth/components/VerifyOtpForm";
const Login = () => {
  return (
    <>
      <AuthHeader headerTitle="تغيير كلمة المرور" />
      <h4>ادخل رمز التحقق المرسل إليك</h4>
      <VerifyOtpForm />
    </>
  );
};

export default Login;
