import * as Yup from "yup";
import type { LoginFormValues } from "../auth.types";
import { loginUser } from "../services/authApi";
import { ShowMessagesAlert } from "@/shared/utils/ShowMessagesAlert";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";
const useLogin = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t("email_validation_message"))
      .required(t("required_message")),
    password: Yup.string()
      .min(5, t("password_min_length"))
      .required(t("required_message")),
  });

  const handleSubmit = (values: LoginFormValues) => {
    setIsLoading(true);
    loginUser(values)
      .then((response) => {
        login(response.data.data.accessToken);
        navigate("/userHome");
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
