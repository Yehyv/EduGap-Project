import * as Yup from "yup";
import type { LoginFormValues } from "../auth.types";
import { loginDashboardUser } from "../services/authApi";
import { ShowMessagesAlert } from "@/shared/utils/ShowMessagesAlert";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";

const useDashboardLogin = () => {
  const { t } = useLanguage();
  const { dashboardLogin, saveRefreshTokenDashoard } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const initialValues: LoginFormValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required(t("required_message")),
    password: Yup.string().required(t("required_message")),
  });

  const handleSubmit = (values: LoginFormValues) => {
    setIsLoading(true);
    loginDashboardUser(values)
      .then(async (response) => {
        const { accessToken, refresh_token } = response.data.data;
        dashboardLogin(accessToken);
        saveRefreshTokenDashoard(refresh_token);
        navigate("/dashboard/home");
      })
      .catch((error) => {
        ShowMessagesAlert(
          error.response?.data?.message || error.message,
          "error",
          t("wrong"),
          t("okay"),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return { validationSchema, handleSubmit, initialValues, isLoading };
};

export default useDashboardLogin;
