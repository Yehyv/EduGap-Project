import { Formik, Form } from "formik";
import { Link } from "react-router-dom";
import { TextField, GradientButton } from "@/shared/components";
import useLogin from "../hooks/useLogin";
import type { LoginFormValues } from "../auth.types";
import { useLanguage } from "@/shared/localization/useLanguage";

const LoginForm = () => {
  const { handleSubmit, initialValues, validationSchema, isLoading } =
    useLogin();
  const { t } = useLanguage();

  return (
    <Formik<LoginFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        <TextField
          label={t("email")}
          name="email"
          type="email"
          placeholder={t("email")}
        />
        <TextField
          label={t("passowrd")}
          name="password"
          type="password"
          placeholder={t("passowrd")}
        />

        <GradientButton
          text={t("login")}
          type="submit"
          moreStyle="mt-5 w-full mx-auto"
          isLoading={isLoading}
        />
        <Link to={"/forgot-password"} className="text-[#767676] text-center">
          {t("forgot_password")}
        </Link>
      </Form>
    </Formik>
  );
};

export default LoginForm;
