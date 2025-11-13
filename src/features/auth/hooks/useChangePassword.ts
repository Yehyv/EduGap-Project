import * as Yup from "yup";
import type { ChangePasswordForForgotPasswordValues } from "../auth.types";
import { useLanguage } from "@/shared/localization/useLanguage";
import { restPasswordForForgetPassword } from "../services/authApi";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const useChangePassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const resetPasswordToken = sessionStorage.getItem("token");

  const initialValues: ChangePasswordForForgotPasswordValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .required(t("password_required"))
      .min(6, t("password_min_length"))
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
        t("password_must_contain_letters_numbers")
      ),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), undefined], t("passwords_do_not_match"))
      .required(t("confirm_password_required")),
  });

  const handleSubmit = async (
    values: ChangePasswordForForgotPasswordValues
  ) => {
    try {
      let response;
      if (resetPasswordToken) {
        response = await restPasswordForForgetPassword(
          values,
          resetPasswordToken
        );
      }
      toast.success(
        response?.data.message ?? t("password_changed_successfully")
      );
      sessionStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error(error);

      const err = error as AxiosError<{ message: string[] | string }>;
      const errorMessage = Array.isArray(err.response?.data?.message)
        ? err.response?.data?.message[0]
        : err.response?.data?.message || t("something_went_wrong");

      Swal.fire({
        title: t("error"),
        text: errorMessage,
        icon: "error",
        confirmButtonText: t("okay"),
      });
    }
  };

  return { validationSchema, handleSubmit, initialValues };
};

export default useChangePassword;
