import { logoutUser } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "../localization/useLanguage";
import UserIcon from "@/assets/svgs/UserIcon.svg?react";
import NotificationIcon from "@/assets/svgs/Notification.svg?react";
import { useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "../types/sharedTypes";

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

  const token = localStorage.getItem("token");
  if (token) {
    const decoded = jwtDecode<TokenPayload>(token);
    console.log("Decoded payload:", decoded);
  }
  const fullName = "محمد عبدالسلام محمد";
  const firstName = fullName?.split(" ")?.[0];

  return (
    <>
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <p className="px-4  text-sm text-gray-700 max-xl:hidden">
          اهلا بك
          <span className="font-medium ms-1 block">{firstName}</span>
          <span className="font-medium ms-1 block">
            {fullName?.split(" ")?.[1]}
          </span>
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
