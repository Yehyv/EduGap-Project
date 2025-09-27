import { lazy, useRef, useState, Suspense } from "react";
import { logoutUser } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "../localization/useLanguage";
import { useClickOutside } from "../hooks/useClickOutside";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "../types/sharedTypes";

// Lazy load components & icons
const UserIcon = lazy(() => import("@/assets/svgs/UserIcon.svg?react"));
const NotificationIcon = lazy(
  () => import("@/assets/svgs/Notification.svg?react")
);
const WalletIcon = lazy(() => import("@/assets/svgs/WalletIcon.svg?react"));
const CoursesIcon = lazy(() => import("@/assets/svgs/MyCoursesIcon.svg?react"));
const CertificateIcon = lazy(
  () => import("@/assets/svgs/CertificateBoldIcon.svg?react")
);
const EditIcon = lazy(() => import("@/assets/svgs/EditIcon.svg?react"));
const LanguageIcon = lazy(() => import("@/assets/svgs/LanguageIcon.svg?react"));
const MoonIcon = lazy(() => import("@/assets/svgs/MoonIcon.svg?react"));
const QuestionIcon = lazy(
  () => import("@/assets/svgs/QuestitionIcon.svg?react")
);
const LogoutIcon = lazy(() => import("@/assets/svgs/LogoutIcon.svg?react"));
const LanguageDropdown = lazy(() => import("./ui/LanguageDropdown"));

const UserNav = () => {
  const { lang, setLang, t } = useLanguage();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(menuRef, () => setOpen(false));

  // Decode JWT if exists
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      console.log("Decoded payload:", decoded);
    } catch (e) {
      console.error("Invalid token:", e);
    }
  }

  // Example: you should replace with real user data from API/context
  const fullName = "محمد عبدالسلام محمد";
  const [firstName, middleName] = fullName.split(" ");

  const handleLogOut = () => {
    logoutUser().then(logout).catch(console.error);
  };

  return (
    <div className="flex items-center gap-4 relative" ref={menuRef}>
      {/* Greeting */}
      <div className="text-gray-700 max-xl:hidden">
        <div className="ms-1 block">
          اهلا بك {firstName} {middleName}
        </div>
      </div>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center cursor-pointer justify-center w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 transition"
        >
          <Suspense
            fallback={<span className="w-6 h-6 bg-gray-300 rounded-full" />}
          >
            <UserIcon className="w-6 h-6 text-gray-700" />
          </Suspense>
        </button>

        {open && (
          <div className="absolute end-0 mt-2 w-70 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="w-10 h-10 bg-primary rounded-full mx-auto text-secondary font-bold center mt-4">
              {firstName[0]} {middleName?.[0]}
            </div>
            <div className="text-center mx-4 border-[#DBDBDB]">
              <div className="font-semibold mt-2">{fullName}</div>
              <div className="text-sm text-[#797979]">
                معهد التكنولوجيا - برنامج التسويق
              </div>
              <div className="text-sm text-[#797979]">
                mohamedabdelsalam21@gmail.com
              </div>
              <div className="text-sm text-secondary center gap-2 mt-2">
                <span>عدد النقاط : 652</span>
                <Suspense fallback={null}>
                  <WalletIcon />
                </Suspense>
              </div>
            </div>

            {/* Menu items */}
            <div className="text-sm mt-2 flex flex-col gap-2 border-b border-t mx-4 border-[#DBDBDB] py-4">
              {[
                { icon: <CoursesIcon />, label: "دوراتي" },
                { icon: <CertificateIcon />, label: "شهاداتي" },
                { icon: <EditIcon />, label: "تعديل البيانات" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Suspense fallback={null}>{item.icon}</Suspense>
                  <div>{item.label}</div>
                </div>
              ))}

              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <Suspense fallback={null}>
                    <LanguageIcon />
                  </Suspense>
                  <div>اللغة</div>
                </div>
                <Suspense fallback={null}>
                  <LanguageDropdown currentLang={lang} onChange={setLang} />
                </Suspense>
              </div>

              <div className="flex items-center gap-2">
                <Suspense fallback={null}>
                  <MoonIcon />
                </Suspense>
                <div>السمة</div>
              </div>

              <div className="flex items-center gap-2">
                <Suspense fallback={null}>
                  <QuestionIcon />
                </Suspense>
                <div>مركز المساعدة</div>
              </div>
            </div>

            <button
              onClick={handleLogOut}
              className="w-full text-start text-sm px-4 py-2 items-center hover:text-red-500 flex gap-2 cursor-pointer"
            >
              <Suspense fallback={null}>
                <LogoutIcon />
              </Suspense>
              <div>{t("logout")}</div>
            </button>
          </div>
        )}
      </div>

      {/* Notification */}
      <Suspense fallback={<span className="w-7 h-7 bg-gray-300 rounded" />}>
        <NotificationIcon className="w-7 h-7 cursor-pointer" />
      </Suspense>
    </div>
  );
};

export default UserNav;
