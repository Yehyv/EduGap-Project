import * as Yup from "yup";
import type { ForgotPasswordFormValues } from "../auth.types";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useState } from "react";
import { forgotPassword } from "../services/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShowMessagesAlert } from "@/shared/utils/ShowMessagesAlert";

const useForgotPassword = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues: ForgotPasswordFormValues = {
    username: "",
    number: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .matches(/^[2-3]\d{13}$/, t("national_id_validation_message"))
      .required(t("required_message")),
    number: Yup.string()
      .trim()
      .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, t("invalid_phone_number"))
      .required(t("required_field")),
  });

  const handleSubmit = (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    forgotPassword(values)
      .then(async (response) => {
        sessionStorage.setItem(
          "challengeId",
          response?.data?.data?.challengeId
        );
        navigate("/forgot-password-verify-otp");
        toast.success(t("otp_sent_successfully"));
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

export default useForgotPassword;
