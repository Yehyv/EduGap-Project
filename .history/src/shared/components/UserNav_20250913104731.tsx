import { logoutUser } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "../localization/useLanguage";
import UserIcon from "@/assets/svgs/UserIcon.svg?react";

const UserNav = () => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const handleLogOut = () => {
    logoutUser()
      .then(() => {
        logout();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <UserIcon className="w-6 h-6" />
      <button onClick={handleLogOut} className="text-red-500 cursor-pointer">
        {t("logout")}
      </button>
      <p className="text-lg">
        <span>اهلا بك.</span>
        <span>محمد عبدالسلام محمد</span>
      </p>
    </>
  );
};

export default UserNav;
