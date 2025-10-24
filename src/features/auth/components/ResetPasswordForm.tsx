import { Formik, Form } from "formik";
import { TextField, GradientButton } from "@/shared/components";
import type { ChangePasswordValues } from "../auth.types";
import useResetPassword from "../hooks/useResetPassword";
import { useLanguage } from "@/shared/localization/useLanguage";

const ResetPasswordForm = () => {
  const { handleSubmit, initialValues, validationSchema } = useResetPassword();
  const { t } = useLanguage();

  return (
    <Formik<ChangePasswordValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        <TextField
          label={t("old_password")}
          name="oldPassword"
          type="password"
          placeholder={t("old_password")}
        />
        <TextField
          label={t("new_password")}
          name="newPassword"
          type="password"
          placeholder={t("enter_password")}
        />
        <TextField
          label={t("confirm_password")}
          name="confirmPassword"
          type="password"
          placeholder={t("reenter_password")}
        />

        <GradientButton text={t("confirm")} type="submit" moreStyle="mt-10" />
      </Form>
    </Formik>
  );
};

export default ResetPasswordForm;
