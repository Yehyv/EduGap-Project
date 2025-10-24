import { Formik, Form } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { TextField, GradientButton, LightButton } from "@/shared/components";
import useLogin from "../hooks/useLogin";
import type { LoginFormValues } from "../auth.types";
import { useLanguage } from "@/shared/localization/useLanguage";

const LoginForm = () => {
  const { handleSubmit, initialValues, validationSchema, isLoading } =
    useLogin();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Formik<LoginFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        <TextField
          label={t("national_id")}
          name="username"
          type="username"
          placeholder={t("national_id")}
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
        <div className="sm:hidden">
          <LightButton
            text={t("continue_button")}
            onClick={() => navigate("/")}
          />
        </div>
      </Form>
    </Formik>
  );
};

export default LoginForm;
