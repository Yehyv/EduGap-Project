import { TextField } from "@/shared/components";
import { useLanguage } from "@/shared/localization/useLanguage";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import EyeIcon from "@/assets/svgs/EyePassIcon.svg?react";
import EyeHideIcon from "@/assets/svgs/EyeHideIcon.svg?react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ButtonLoader from "@/shared/components/ButtonLoader";
import { changePasswordFromProfile } from "@/features/ProfileSettings/services/profileSettingsApis";
import type { ChangePasswordTypes } from "@/shared/types/sharedTypes";

const ChangePasswordFromProfile = () => {
  const { t } = useLanguage();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (values: ChangePasswordTypes) =>
      changePasswordFromProfile(values),
    onSuccess: () => {
      toast.success(t("password_changed_successfully"));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message[0] || t("errorOccurred"));
    },
  });

  return (
    <Formik
      initialValues={{
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }}
      validationSchema={Yup.object({
        oldPassword: Yup.string().required(t("required")),
        newPassword: Yup.string()
          .min(6, t("min_6_chars"))
          .required(t("required")),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref("newPassword")], t("passwords_do_not_match"))
          .required(t("required")),
      })}
      onSubmit={(values) =>
        mutate({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        })
      }
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-4">
          {/* Current Password */}
          <div className="relative">
            <TextField
              label={t("current_password")}
              name="oldPassword"
              type={showOld ? "text" : "password"}
            />
            <button
              type="button"
              className="absolute end-2 top-[34px] cursor-pointer"
              onClick={() => setShowOld(!showOld)}
            >
              {showOld ? <EyeHideIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <TextField
              label={t("new_password")}
              name="newPassword"
              type={showNew ? "text" : "password"}
            />
            <button
              type="button"
              className="absolute end-2 top-[34px] cursor-pointer"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeHideIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <TextField
              label={t("confirm_password")}
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
            />
            <button
              type="button"
              className="absolute end-2 top-[34px] cursor-pointer"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeHideIcon /> : <EyeIcon />}
            </button>
          </div>

          <button
            type="submit"
            className="bg-secondary mx-auto grid text-white px-6 py-2 rounded"
            disabled={isPending}
          >
            {isPending ? <ButtonLoader /> : t("save_password")}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ChangePasswordFromProfile;
