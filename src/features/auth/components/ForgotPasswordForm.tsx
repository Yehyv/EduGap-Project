import { Formik, Form } from "formik";
import { Link } from "react-router-dom";
import { TextField, GradientButton } from "@/shared/components";
import type { ForgotPasswordFormValues } from "../auth.types";
import useForgotPassword from "../hooks/useForgotPassword";
import { useLanguage } from "@/shared/localization/useLanguage";

const ForgotPasswordForm = () => {
  const { t } = useLanguage();
  const { handleSubmit, initialValues, validationSchema, isLoading } =
    useForgotPassword();

  return (
    <Formik<ForgotPasswordFormValues>
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
          label={t("enter_phone_number")}
          name="number"
          type="tel"
          placeholder="01* **** ****"
          maxLength={11}
          onlyNumbers
        />

        <GradientButton
          text={t("confirm")}
          type="submit"
          moreStyle="mt-5 w-full mx-auto"
          isLoading={isLoading}
        />
        <Link to={"/login"} className="text-[#767676] text-center">
          {t("back")}
        </Link>
      </Form>
    </Formik>
  );
};

export default ForgotPasswordForm;
