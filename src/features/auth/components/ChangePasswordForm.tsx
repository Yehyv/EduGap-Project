import { Formik, Form } from "formik";
import { TextField, GradientButton } from "@/shared/components";
import type { ChangePasswordForForgotPasswordValues } from "../auth.types";
import { useLanguage } from "@/shared/localization/useLanguage";
import useChangePassword from "../hooks/useChangePassword";

const ChangePasswordForm = () => {
  const { handleSubmit, initialValues, validationSchema } = useChangePassword();
  const { t } = useLanguage();

  return (
    <Formik<ChangePasswordForForgotPasswordValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="flex flex-col gap-2 max-w-sm mx-auto w-full">
        <TextField
          label={t("new_password")}
          name="newPassword"
          type="password"
          placeholder={t("enter_password")}
        />
        <span className="text-[12px] text-gray-500">
          {t("password_requirements")}
        </span>
        <TextField
          label={t("confirm_password")}
          name="confirmPassword"
          type="password"
          placeholder={t("reenter_password")}
        />

        <GradientButton text={t("confirm")} type="submit" moreStyle="mt-5" />
      </Form>
    </Formik>
  );
};

export default ChangePasswordForm;
