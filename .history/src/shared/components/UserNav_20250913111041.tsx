import { logoutUser } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "../localization/useLanguage";
import UserIcon from "@/assets/svgs/UserIcon.svg?react";
import NotificationIcon from "@/assets/svgs/Notification.svg?react";
import { useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";

const UserNav = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(menuRef, () => setOpen(false));

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
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <p className="px-4 py-2 text-sm text-gray-700">
          اهلا بك
          <span className="font-medium">محمد عبدالسلام محمد</span>
        </p>
        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center cursor-pointer justify-center w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            <UserIcon className="w-6 h-6 text-gray-700" />
          </button>

          {open && (
            <div className="absolute end-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={handleLogOut}
                className="w-full font-bold text-start px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
              >
                {t("logout")}
              </button>
            </div>
          )}
        </div>

        {/* Notification */}
        <NotificationIcon className="w-7 h-7 cursor-pointer" />
      </div>
    </>
  );
};

export default UserNav;
