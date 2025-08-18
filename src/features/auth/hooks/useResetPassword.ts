import * as Yup from "yup";
import type { ResetPasswordFormValues } from "../auth.types";

const useResetPassword = () => {
  const initialValues: ResetPasswordFormValues = {
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .required("كلمة المرور مطلوبة")
      .min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل")
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
        "كلمة المرور يجب أن تحتوي على أحرف وأرقام على الأقل"
      ),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), undefined], "كلمة المرور غير متطابقة")
      .required("تأكيد كلمة المرور مطلوب"),
  });

  const handleSubmit = (values: ResetPasswordFormValues) => {
    console.log("Form data", values);
  };

  return { validationSchema, handleSubmit, initialValues };
};

export default useResetPassword;
