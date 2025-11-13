import { Formik, Form, ErrorMessage } from "formik";
import type { VerifyOtpValues } from "../auth.types";
import { GradientButton } from "@/shared/components";
import useVerifyOtp from "../hooks/useVerifyOtp";
import OtpInput from "react-otp-input";
import { useLanguage } from "@/shared/localization/useLanguage";

const VerifyOtpForm = ({
  isForForgotPassword = false,
}: {
  isForForgotPassword?: boolean;
}) => {
  const { t } = useLanguage();
  const {
    handleSubmit,
    initialValues,
    validationSchema,
    handleResend,
    timeLeft,
    formatTime,
  } = useVerifyOtp(isForForgotPassword);

  return (
    <Formik<VerifyOtpValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className="flex flex-col gap-4 max-w-sm mx-auto w-full" dir="ltr">
          <OtpInput
            value={values.code}
            onChange={(val) => {
              const onlyNums = val.replace(/\D/g, "");
              setFieldValue("code", onlyNums);
            }}
            numInputs={6}
            shouldAutoFocus
            renderInput={(props) => (
              <input
                {...props}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                dir="ltr"
                className={`!w-10 h-10 border rounded-lg text-center text-lg border-[#BCBCBC] focus:outline-none focus:border-tertiary ${
                  String(props.value).length > 0 ? "border-tertiary" : ""
                }`}
              />
            )}
            containerStyle="flex justify-center gap-4 mt-4"
          />

          <ErrorMessage
            name="code"
            component="div"
            className="text-red-500 text-sm text-center"
          />

          <GradientButton text={t("confirm")} type="submit" moreStyle="mt-10" />

          {timeLeft > 0 ? (
            <div className="text-[#767676] text-center">
              {t("resend_in")} {formatTime(timeLeft)}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleResend()}
              className="text-[#767676] text-center cursor-pointer"
            >
              {t("resend")}
            </button>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default VerifyOtpForm;
