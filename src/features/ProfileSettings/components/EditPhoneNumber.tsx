import EditIcon from "@/assets/svgs/EditIcon.svg?react";
import { useMutation } from "@tanstack/react-query";
import { FormikInput } from "@/shared/components/forms/FormikInput";
import { Formik, Form } from "formik";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ButtonLoader from "@/shared/components/ButtonLoader";
import MyModal from "@/shared/components/ui/MyModal";
import OtpInput from "react-otp-input";
import type { VerifyOtpValues } from "@/features/auth/auth.types";
import useVerifyOtp from "@/features/auth/hooks/useVerifyOtp";
import * as Yup from "yup";
import { changePhoneNumberVerifyOtp } from "../services/profileSettingsApis";
import { useLanguage } from "@/shared/localization/useLanguage";

export const EditPhoneNumber = ({
  label,
  name,
  type = "text",
  initialValue,
  validationSchema,
  updateFunction,
  successMessage,
}: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhone, setCurrentPhone] = useState(initialValue);
  const { t } = useLanguage();
  const { initialValues } = useVerifyOtp();

  useEffect(() => {
    setCurrentPhone(initialValue);
  }, [initialValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: updateFunction,
    onSuccess: (response) => {
      setIsEditing(false);
      setModalOpen(true);
      toast.success(successMessage);

      if (response?.challengeId) {
        sessionStorage.setItem("changeNumber", response?.challengeId);
        sessionStorage.setItem("phone", currentPhone);
      }
    },
  });

  const { mutate: sendOtpMutate, isPending: sendOtpPending } = useMutation({
    mutationFn: ({
      code,
      challengeId,
      newPhone,
    }: {
      code?: string;
      challengeId: string | null;
      newPhone: string | null;
    }) => changePhoneNumberVerifyOtp(code || "", challengeId, newPhone),
    onSuccess: () => {
      toast.success(t("otpSuccess"));
      setModalOpen(false);
      sessionStorage.removeItem("changeNumber");
      sessionStorage.removeItem("phone");
    },
    onError: (error: any) => {
      console.log(error);
      toast.error(error?.response?.data?.message[0] ?? t("errorOccurred"));
    },
  });

  const handleVerifyOtp = (values: { code: string }) => {
    sendOtpMutate({
      code: values.code,
      challengeId: sessionStorage.getItem("changeNumber"),
      newPhone: sessionStorage.getItem("phone"),
    });
  };

  const handleResendOtp = () => {
    mutate(currentPhone);
  };

  const otpSchema = Yup.object({
    code: Yup.string()
      .required(t("otpRequired"))
      .length(6, t("otpMustBe6Digits")),
  });

  return (
    <>
      <Formik
        initialValues={{ [name]: currentPhone }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          setCurrentPhone(values[name]);
          mutate(values[name]);
        }}
        enableReinitialize
      >
        {() => (
          <>
            {label && (
              <label className="block mb-1 text-sm font-semibold">
                {label}:
              </label>
            )}

            <Form className="flex max-sm:flex-col gap-4 items-center relative mb-5">
              <div className="flex-1 relative w-full">
                <FormikInput
                  label={label}
                  name={name}
                  type={type}
                  disabled={!isEditing}
                />

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="absolute end-3 top-1.5 cursor-pointer"
                  >
                    <EditIcon />
                  </button>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-3 shrink-0">
                  <button
                    type="submit"
                    className="bg-secondary text-white px-4 py-1.5 rounded"
                  >
                    {isPending ? <ButtonLoader /> : t("save")}
                  </button>

                  <button
                    disabled={isPending}
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border px-4 py-1 rounded"
                  >
                    {t("cancel")}
                  </button>
                </div>
              )}
            </Form>
          </>
        )}
      </Formik>

      <MyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        headerBgColor="bg-white"
        headerTextColor="text-black"
        headerComponent={
          <>
            <h3>{t("confirmPhoneNumber")}</h3>
            <p className="text-sm text-[#797979]">{t("enterOtpSentToPhone")}</p>
          </>
        }
      >
        <div className="text-center space-y-4">
          <Formik<VerifyOtpValues>
            initialValues={initialValues}
            validationSchema={otpSchema}
            onSubmit={handleVerifyOtp}
          >
            {({ values, setFieldValue }) => (
              <Form
                className="flex flex-col gap-4 max-w-sm mx-auto w-full"
                dir="ltr"
              >
                <div className="flex justify-center gap-4 mt-4">
                  <OtpInput
                    value={values.code}
                    onChange={(val) =>
                      setFieldValue("code", val.replace(/\D/g, ""))
                    }
                    numInputs={6}
                    shouldAutoFocus
                    containerStyle="flex justify-center gap-2 mt-4"
                    renderInput={(props) => (
                      <input
                        {...props}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        dir="ltr"
                        className={`max-sm:!w-8 max-sm:h-10 !w-14 h-14 border rounded-lg text-center text-lg border-[#BCBCBC] focus:outline-none focus:border-tertiary ${
                          String(props.value).length > 0
                            ? "border-tertiary"
                            : ""
                        }`}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    type="submit"
                    className="cursor-pointer rounded-2xl bg-secondary text-white px-6 py-1.5"
                    disabled={values.code.length !== 6}
                  >
                    {t("confirmOtp")}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="cursor-pointer w-fit mx-auto text-[#797979] px-2 py-1.5"
                    disabled={sendOtpPending}
                  >
                    {sendOtpPending ? <ButtonLoader /> : t("resendOtp")}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </MyModal>
    </>
  );
};
