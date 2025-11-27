import {
  changePhoneNumber,
  changeUserName,
} from "@/features/ProfileSettings/services/profileSettingsApis";
import { EditPhoneNumber } from "@/features/ProfileSettings/components/EditPhoneNumber";
import Profile from "@/assets/imgs/Profile.png";
import * as Yup from "yup";
import { EditableInput } from "@/shared/components/forms/EditableInput";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useUser } from "@/features/auth/context/UserContext";
const ChangeProfileData = () => {
  const { t } = useLanguage();
  const { user: userData, fetchUser } = useUser();
  const user = {
    username: userData?.userName,
    phone: "01012345678",
    email: "test@email.com",
  };
  return (
    <>
      <div className="flex max-md:flex-col gap-4 items-center mb-5">
        <img src={Profile} className="rounded-full w-30 h-30" alt=""></img>
        <button className="inline-block font-semibold underline cursor-pointer text-[#797979]">
          {t("upload_edit_image")}
        </button>
      </div>

      <EditableInput
        label={t("username")}
        name="username"
        type="text"
        initialValue={user.username}
        apiKey="username"
        updateFunction={changeUserName}
        refetchFunction={fetchUser}
        successMessage={t("username_changed_successfully")}
        validationSchema={Yup.object({
          username: Yup.string().min(3).required(t("required")),
        })}
      />

      <EditPhoneNumber
        label={t("enter_phone_number")}
        successMessage={t("otp_sent_successfully")}
        name="phone"
        type="text"
        initialValue={user.phone}
        apiKey="phone"
        updateFunction={changePhoneNumber}
        validationSchema={Yup.object({
          phone: Yup.string()
            .matches(/^[0-9]+$/, t("numbers_only"))
            .min(11, t("invalid_number"))
            .required(t("required")),
        })}
      />
    </>
  );
};

export default ChangeProfileData;
