import * as Yup from "yup";
import type { LoginFormValues } from "../auth.types";
import { loginUser } from "../services/authApi";
import { showMessagesAlert } from "@/shared/utils/showMessagesAlert";
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
    loginUser(values)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error.response.data.message || error.message);

        // showMessagesAlert(error.message)
      });
  };

  return { validationSchema, handleSubmit, initialValues };
};

export default useLogin;
