import * as Yup from "yup";
import type { LoginFormValues } from "../auth.types";
const useLogin = () => {
  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("البريد الإلكتروني غير صالح")
      .required("هذا الحقل مطلوب"),
    password: Yup.string()
      .min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل")
      .required("هذا الحقل مطلوب"),
  });

  const handleSubmit = (values: LoginFormValues) => {
    console.log("Form data", values);
  };

  return { validationSchema, handleSubmit, initialValues };
};

export default useLogin;
