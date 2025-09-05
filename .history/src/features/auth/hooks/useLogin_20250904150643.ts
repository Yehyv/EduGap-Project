import * as Yup from "yup";
import type { LoginFormValues } from "../auth.types";
import { loginUser } from "../services/authApi";
import { ShowMessagesAlert } from "@/shared/utils/ShowMessagesAlert";
import { useState } from "react";
const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("البريد الإلكتروني غير صالح")
      .required("هذا الحقل مطلوب"),
    password: Yup.string()
      .min(5, "يجب أن تكون كلمة المرور 5 أحرف على الأقل")
      .required("هذا الحقل مطلوب"),
  });

  const handleSubmit = (values: LoginFormValues) => {
    setIsLoading(true);
    loginUser(values)
      .then((response) => {
        console.log(response.data.data.refreshToken);
      })
      .catch((error) => {
        console.log(error.response.data.message || error.message);
        ShowMessagesAlert(error.response.data.message || error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return { validationSchema, handleSubmit, initialValues, isLoading };
};

export default useLogin;
