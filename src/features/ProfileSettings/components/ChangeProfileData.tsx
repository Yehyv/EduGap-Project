import {
  changePhoneNumber,
  changeUserName,
  getProfileData,
  updateUserImage,
} from "@/features/ProfileSettings/services/profileSettingsApis";
import { EditPhoneNumber } from "@/features/ProfileSettings/components/EditPhoneNumber";
import Profile from "@/assets/imgs/Profile.png";
import * as Yup from "yup";
import { EditableInput } from "@/shared/components/forms/EditableInput";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useUser } from "@/features/auth/context/UserContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import ButtonLoader from "@/shared/components/ButtonLoader";

const ChangeProfileData = () => {
  const { t } = useLanguage();
  const { fetchUser } = useUser();

  const { data, isLoading: loadingSubmitImage } = useQuery({
    queryKey: ["getProfileData"],
    queryFn: getProfileData,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: updateUserImage,
    onSuccess: () => {
      fetchUser();
      setPreviewImage(null);
      setSelectedFile(null);
    },
  });

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleRemoveNewImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleSave = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    mutation.mutate(formData);
  };

  const displayedImage = previewImage || data?.user_image || Profile;

  return (
    <>
      <div className="flex max-md:flex-col gap-4 items-center mb-5 relative">
        {/* Preview Image */}
        <img
          src={displayedImage}
          className="rounded-full w-30 h-30 object-cover"
          alt="profile"
        />

        {/* Upload Button */}
        <div className="flex flex-col gap-4  items-center">
          <label className="inline-block font-semibold underline cursor-pointer text-[#797979]">
            {t("upload_edit_image")}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
          {/* Save button */}
          {previewImage && (
            <button
              disabled={loadingSubmitImage}
              onClick={handleSave}
              className="mb-5 px-4 py-2 bg-secondary text-white rounded-lg cursor-pointer"
            >
              {loadingSubmitImage ? <ButtonLoader /> : t("save")}
            </button>
          )}
        </div>

        {/* Remove new image button */}
        {previewImage && (
          <button
            onClick={handleRemoveNewImage}
            className="absolute -top-2 -start-2 cursor-pointer bg-red-500 text-white p-1 rounded-full w-7 h-7 flex items-center justify-center"
          >
            X
          </button>
        )}
      </div>

      {/* Username */}
      <EditableInput
        label={t("username")}
        name="username"
        type="text"
        initialValue={data?.full_name}
        apiKey="username"
        updateFunction={changeUserName}
        refetchFunction={fetchUser}
        refetchFunctionKey={"getProfileData"}
        successMessage={t("username_changed_successfully")}
        validationSchema={Yup.object({
          username: Yup.string().min(3).required(t("required")),
        })}
      />

      {/* Phone number */}
      <EditPhoneNumber
        label={t("enter_phone_number")}
        successMessage={t("otp_sent_successfully")}
        name="phone"
        type="text"
        initialValue={data?.phone}
        apiKey="phone"
        updateFunction={changePhoneNumber}
        refetchFunctionKey={"getProfileData"}
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
