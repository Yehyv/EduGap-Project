import { logoutUser } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "../localization/useLanguage";
import UserIcon from "@/assets/svgs/UserIcon.svg?react";
import NotificationIcon from "@/assets/svgs/Notification.svg?react";
import { useEffect, useRef, useState } from "react";

const UserNav = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        {/* Notification */}
        <NotificationIcon className="w-7 h-7 cursor-pointer" />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            <UserIcon className="w-6 h-6 text-gray-700" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <p className="px-4 py-2 text-sm text-gray-700 border-b">
                اهلا بك
                <br />
                <span className="font-medium">محمد عبدالسلام محمد</span>
              </p>
              <button
                onClick={handleLogOut}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
              >
                {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserNav;
