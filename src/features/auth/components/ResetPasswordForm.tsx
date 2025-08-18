import { Formik, Form } from "formik";
import TextField from "@/shared/components/forms/TextField";
import type { ResetPasswordFormValues } from "../auth.types";
import GradientButton from "@/shared/components/ui/GradientButton";
import useResetPassword from "../hooks/useResetPassword";

const ResetPasswordForm = () => {
  const { handleSubmit, initialValues, validationSchema } = useResetPassword();

  return (
    <Formik<ResetPasswordFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        <TextField
          label="كلمة المرور"
          name="password"
          type="password"
          placeholder="كلمة المرور"
        />
        <TextField
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          type="password"
          placeholder="تأكيد كلمة المرور"
        />

        <GradientButton text="تأكيد" type="submit" moreStyle="mt-10" />
      </Form>
    </Formik>
  );
};

export default ResetPasswordForm;
