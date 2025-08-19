import { Formik, Form } from "formik";
import { Link } from "react-router-dom";
import { TextField, GradientButton } from "@/shared/components";
import type { ForgotPasswordFormValues } from "../auth.types";
import useForgotPassword from "../hooks/useForgotPassword";

const ForgotPasswordForm = () => {
  const { handleSubmit, initialValues, validationSchema } = useForgotPassword();

  return (
    <Formik<ForgotPasswordFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        <TextField
          label="ادخل رقم الهاتف"
          name="number"
          type="tel"
          placeholder="ادخل رقم الهاتف"
          maxLength={11}
          onlyNumbers
        />

        <GradientButton text="تأكيد" type="submit" moreStyle="mt-10" />
        <Link to={"/login"} className="text-[#767676] text-center">
          رجوع
        </Link>
      </Form>
    </Formik>
  );
};

export default ForgotPasswordForm;
