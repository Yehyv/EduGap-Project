import * as Yup from "yup";
import type { ChangePasswordValues } from "../auth.types";
import { useLanguage } from "@/shared/localization/useLanguage";
import { changePassword } from "../services/authApi";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const useResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const resetPasswordToken = sessionStorage.getItem("token");

  const initialValues: ChangePasswordValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    oldPassword: Yup.string().required(t("required")),
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

  const handleSubmit = async (values: ChangePasswordValues) => {
    try {
      let response;
      if (resetPasswordToken) {
        response = await changePassword(values, resetPasswordToken);
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

export default useResetPassword;
