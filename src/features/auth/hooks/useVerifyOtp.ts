import * as Yup from "yup";
import type { VerifyOtpFormValues } from "../auth.types";
const useVerifyOtp = () => {
  const initialValues: VerifyOtpFormValues = {
    otp: "",
  };

  const validationSchema = Yup.object({
    otp: Yup.string()
      .matches(/^[0-9]{6}$/, "OTP يجب أن يكون 6 أرقام")
      .required("هذا الحقل مطلوب"),
  });

  const handleSubmit = (values: VerifyOtpFormValues) => {
    console.log("Form data", values);
  };

  return { validationSchema, handleSubmit, initialValues };
};

export default useVerifyOtp;
