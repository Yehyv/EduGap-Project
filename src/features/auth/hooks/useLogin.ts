import * as Yup from "yup";
import type { LoginFormValues } from "../auth.types";
import { loginUser } from "../services/authApi";
import { ShowMessagesAlert } from "@/shared/utils/ShowMessagesAlert";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";

const useLogin = () => {
  const { t } = useLanguage();
  const { fetchUser } = useUser();
  const { login, saveRefreshToken } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const initialValues: LoginFormValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .matches(/^[2-3]\d{13}$/, t("national_id_validation_message"))
      .required(t("required_message")),
    password: Yup.string()
      .min(5, t("password_min_length"))
      .required(t("required_message")),
  });

  const handleSubmit = (values: LoginFormValues) => {
    setIsLoading(true);
    loginUser(values)
      .then(async (response) => {
        if (response?.data?.data?.mustVerifyOtp) {
          sessionStorage.setItem(
            "challengeId",
            response?.data?.data?.challengeId
          );
          navigate("/verify-otp");
          toast.success(t("otp_sent_successfully"));
        } else {
          const { accessToken, refreshToken } = response.data.data;
          login(accessToken);
          saveRefreshToken(refreshToken);
          await fetchUser();

          navigate("/userHome");
        }
      })
      .catch((error) => {
        ShowMessagesAlert(
          error.response?.data?.message || error.message,
          "error",
          t("wrong"),
          t("okay")
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return { validationSchema, handleSubmit, initialValues, isLoading };
};

export default useLogin;
