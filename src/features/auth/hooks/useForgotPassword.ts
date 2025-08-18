import * as Yup from "yup";
import type { ForgotPasswordFormValues } from "../auth.types";

const useForgotPassword = () => {
  const initialValues: ForgotPasswordFormValues = {
    number: "",
  };

  const validationSchema = Yup.object({
    number: Yup.string()
      .trim()
      .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, "رقم الهاتف غير صالح")
      .required("هذا الحقل مطلوب"),
  });

  const handleSubmit = (values: ForgotPasswordFormValues) => {
    console.log("Form data", values);
  };

  return { validationSchema, handleSubmit, initialValues };
};

export default useForgotPassword;
