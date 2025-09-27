import { logoutUser } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "../localization/useLanguage";
import UserIcon from "@/assets/svgs/UserIcon.svg?react";
import NotificationIcon from "@/assets/svgs/Notification.svg?react";
import { useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "../types/sharedTypes";
import WalletIcon from "@/assets/svgs/WalletIcon.svg?react";
import CoursesIcon from "@/assets/svgs/MyCoursesIcon.svg?react";
import CertificateIcon from "@/assets/svgs/CertificateIcon.svg";
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
        <div className="text-gray-700 max-xl:hidden">
          <div className=" ms-1 block">
            اهلا بك {firstName} {fullName?.split(" ")?.[1]}
          </div>
        </div>
        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center cursor-pointer justify-center w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            <UserIcon className="w-6 h-6 text-gray-700" />
          </button>

          {open && (
            <div className="absolute end-0 mt-2 w-70 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="w-10 h-10 bg-primary rounded-full mx-auto text-secondary font-bold center mt-4">
                م ع
              </div>
              <div className="text-center border-b mx-4 border-[#DBDBDB] pb-2">
                <div className="font-semibold mt-2">{fullName}</div>
                <div className="text-sm text-[#797979]">
                  معهد التكنولوجيا - برنامج التسويق{" "}
                </div>
                <div className="text-sm text-[#797979]">
                  mohamedabdelsalam21@gmail.com
                </div>
                <div className="text-sm text-secondary center gap-2 mt-2">
                  <span>عدد النقاط : 652</span>
                  <WalletIcon />
                </div>
              </div>
              <div className="text-sm px-4 mt-2">
                <div className="flex items-center gap-2">
                  <CoursesIcon />
                  <div>دوراتي</div>
                </div>
                <div className="flex items-center gap-2">
                  <CertificateIcon />
                  <div>دوراتي</div>
                </div>
              </div>
              <button
                onClick={handleLogOut}
                className="w-full text-start text-sm px-4 py-2 text-red-500 hover:bg-gray-100"
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
