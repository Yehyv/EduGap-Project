import * as Yup from "yup";
import type { ApiErrorResponse, VerifyOtpValues } from "../auth.types";
import { resetOtp, verifyOtp } from "../services/authApi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";

const VERIFY_OTP_DURATION = 10; // 3 minutes
const STORAGE_KEY = "otpEndTime";

const useVerifyOtp = () => {
  const { t } = useLanguage();

  const challengeId = sessionStorage.getItem("challengeId");
  const initialValues: VerifyOtpValues = {
    code: "",
  };
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    code: Yup.string()
      .matches(/^[0-9]{6}$/, t("otp_must_be_6_digits"))
      .required(t("field_is_required")),
  });

  const handleSubmit = async (values: VerifyOtpValues) => {
    try {
      const response = await verifyOtp({
        code: values.code,
        challengeId: challengeId,
      });

      if (response.data.data.mustChangePassword) {
        toast.success(t("otp_verified_successfully"));
        sessionStorage.removeItem("challengeId");
        sessionStorage.setItem("token", response.data.data.accessToken);
        navigate("/reset-password");
      } else {
        navigate("/login");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ApiErrorResponse>;

      const errorMessage = Array.isArray(err.response?.data?.message)
        ? err.response?.data?.message[0]
        : err.response?.data?.message || t("verification_failed_title");

      Swal.fire({
        title: errorMessage,
        text: t("verification_failed_message"),
        icon: "error",
        confirmButtonText: t("okay"),
      });
    }
  };

  const getRemainingTime = () => {
    const savedEndTime = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    if (savedEndTime && +savedEndTime > now) {
      return Math.floor((+savedEndTime - now) / 1000);
    }
    return VERIFY_OTP_DURATION;
  };

  const [timeLeft, setTimeLeft] = useState(getRemainingTime);

  const handleResend = async () => {
    try {
      const response = await resetOtp(challengeId);
      const newEndTime = Date.now() + VERIFY_OTP_DURATION * 1000;
      localStorage.setItem(STORAGE_KEY, newEndTime.toString());
      setTimeLeft(VERIFY_OTP_DURATION);
      sessionStorage.setItem(
        "challengeId",
        response.data.data.data.challengeId
      );
      toast.success(t("otp_resent_successfully"));
      console.log(response);
    } catch (error: unknown) {
      const err = error as AxiosError<ApiErrorResponse>;
      const errorMessage = Array.isArray(err.response?.data?.message)
        ? err.response?.data?.message[0]
        : err.response?.data?.message || t("resend_failed_title");

      Swal.fire({
        title: errorMessage,
        text: t("resend_failed_message"),
        icon: "error",
        confirmButtonText: t("okay"),
      });
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const updated = prev - 1;
        if (updated <= 0) localStorage.removeItem(STORAGE_KEY);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const endTime = Date.now() + VERIFY_OTP_DURATION * 1000;
      localStorage.setItem(STORAGE_KEY, endTime.toString());
    }
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return {
    validationSchema,
    handleSubmit,
    initialValues,
    handleResend,
    timeLeft,
    formatTime,
  };
};

export default useVerifyOtp;
