import AuthHeader from "@/features/auth/components/AuthHeader";
import LoginForm from "@/features/auth/components/LoginForm";
const Login = () => {
  return (
    <>
      <AuthHeader headerTitle="قم بتسجيل الدخول لحسابك" />
      <LoginForm />
    </>
  );
};

export default Login;
