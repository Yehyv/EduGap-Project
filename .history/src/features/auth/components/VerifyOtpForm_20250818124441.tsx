import { Formik, Form, ErrorMessage } from "formik";
import type { VerifyOtpFormValues } from "../auth.types";
import GradientButton from "@/shared/components/ui/GradientButton";
import useVerifyOtp from "../hooks/useVerifyOtp";
import OtpInput from "react-otp-input";

const VerifyOtpForm = () => {
  const { handleSubmit, initialValues, validationSchema } = useVerifyOtp();

  return (
    <Formik<VerifyOtpFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className="flex flex-col gap-4 max-w-sm mx-auto w-full" dir="ltr">
          <OtpInput
            value={values.otp}
            onChange={(val) => {
              const onlyNums = val.replace(/\D/g, "");
              setFieldValue("otp", onlyNums);
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
            name="otp"
            component="div"
            className="text-red-500 text-sm text-center"
          />

          <GradientButton text="تأكيد" type="submit" moreStyle="mt-10" />
          <button
            type="button"
            className="text-[#767676] text-center cursor-pointer"
          >
            إعادة الإرسال
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default VerifyOtpForm;
