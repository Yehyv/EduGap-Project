import { Formik, Form } from "formik";
import { Link } from "react-router-dom";
import { TextField, GradientButton } from "@/shared/components";
import useLogin from "../hooks/useLogin";
import type { LoginFormValues } from "../auth.types";

const LoginForm = () => {
  const { handleSubmit, initialValues, validationSchema } = useLogin();

  return (
    <Formik<LoginFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        <TextField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          placeholder="البريد الإلكتروني"
        />
        <TextField
          label="كلمة المرور"
          name="password"
          type="password"
          placeholder="كلمة المرور"
        />

        <GradientButton
          text="تسجيل الدخول"
          type="submit"
          moreStyle="mt-10 w-full"
        />
        <Link to={"/forgot-password"} className="text-[#767676] text-center">
          هل نسيت كلمة المرور؟
        </Link>
      </Form>
    </Formik>
  );
};

export default LoginForm;
