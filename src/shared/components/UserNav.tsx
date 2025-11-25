import { lazy, useRef, useState, Suspense } from "react";
import { logoutUser } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "../localization/useLanguage";
import { useClickOutside } from "../hooks/useClickOutside";
import { useUser } from "@/features/auth/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import SmoothLazy from "./SmoothLazy";

const UserIcon = SmoothLazy(
  () => import("@/assets/svgs/UserIcon.svg?react"),
  "w-6 h-6"
);
// const NotificationIcon = smoothLazy(
//   () => import("@/assets/svgs/Notification.svg?react"),
//   "w-7 h-7"
// );
// const WalletIcon = smoothLazy(
//   () => import("@/assets/svgs/WalletIcon.svg?react"),
//   "w-5 h-5"
// );
const CoursesIcon = SmoothLazy(
  () => import("@/assets/svgs/MyCoursesIcon.svg?react"),
  "w-5 h-5"
);
const SavedIcon = SmoothLazy(
  () => import("@/assets/svgs/SaveIconWhite.svg?react"),
  "w-5 h-5"
);
const CertificateIcon = SmoothLazy(
  () => import("@/assets/svgs/CertificateBoldIcon.svg?react"),
  "w-5 h-5"
);
// const EditIcon = SmoothLazy(
//   () => import("@/assets/svgs/EditIcon.svg?react"),
//   "w-5 h-5"
// );
const LanguageIcon = SmoothLazy(
  () => import("@/assets/svgs/LanguageIcon.svg?react"),
  "w-5 h-5"
);
const MoonIcon = SmoothLazy(
  () => import("@/assets/svgs/MoonIcon.svg?react"),
  "w-5 h-5"
);
const QuestionIcon = SmoothLazy(
  () => import("@/assets/svgs/QuestitionIcon.svg?react"),
  "w-5 h-5"
);
const LogoutIcon = SmoothLazy(
  () => import("@/assets/svgs/LogoutIcon.svg?react"),
  "w-5 h-5"
);
const SettingIcon = SmoothLazy(
  () => import("@/assets/svgs/SettingIcon.svg?react"),
  "w-5 h-5"
);

const LanguageDropdown = lazy(() => import("./ui/LanguageDropdown"));

const UserNav = () => {
  const { lang, setLang, t } = useLanguage();
  const { logout } = useAuth();
  const { logout: clearUserData } = useUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();
  useClickOutside(menuRef, () => setOpen(false));

  const handleLogOut = () => {
    logoutUser()
      .then(() => {
        logout();
        navigate("/login");
        clearUserData();
      })
      .catch(console.error);
  };

  // Menu Animation
  const pop = {
    initial: { opacity: 0, scale: 0.93, y: -6 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.18, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.92, y: -6, transition: { duration: 0.12 } },
  };

  return (
    <div
      className="flex items-center gap-2 relative xl:ms-4 text-lg max-xl:text-sm"
      ref={menuRef}
    >
      {/* Greeting */}
      <div className="max-sm:hidden text-gray-400 text-nowrap">
        <span className="me-1">{t("welcome_for_user")}</span>
        <span>{user?.userName}</span>
      </div>

      {/* User button */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center cursor-pointer justify-center w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 transition"
      >
        <UserIcon />
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={pop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute top-12 max-sm:-end-12 end-0 w-72 bg-white rounded-lg shadow-[0_6px_20px_-2px_rgba(0,0,0,0.15)] border border-gray-200 z-50"
          >
            {/* Info */}
            <div className="flex justify-between gap-4 items-center px-4">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-12 h-12 flex-shrink-0 bg-primary rounded-full overflow-hidden text-secondary font-bold grid place-items-center mt-4"
              >
                {user?.userImage ? (
                  <img
                    src={user?.userImage}
                    alt={user?.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.userName?.[0]
                )}
              </motion.div>

              <div>
                <div className="font-semibold mt-2">{user?.userName}</div>
                <div className="text-sm text-[#797979]">
                  <span>{user?.instituteName}</span> -
                  <span className="mx-1">{user?.programName}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="text-[16px] mt-3 flex flex-col gap-2 border-b border-t mx-4 border-[#DBDBDB] py-4">
              {[
                {
                  icon: <CoursesIcon />,
                  label: t("my_courses"),
                  to: "my-courses",
                },
                {
                  icon: <CertificateIcon />,
                  label: t("my_certificates"),
                  to: "",
                },
                {
                  icon: <SavedIcon />,
                  label: t("saved_items"),
                  to: "saved-items",
                },
                {
                  icon: <SettingIcon />,
                  label: t("profile_settings"),
                  to: "profile-settings",
                },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ x: 4, opacity: 0.9 }}>
                  <Link
                    className="flex items-center gap-2 cursor-pointer"
                    to={item.to}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}

              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <MoonIcon />
                <span>{t("theme")}</span>
              </motion.div>

              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <QuestionIcon />
                <span>{t("help_center")}</span>
              </motion.div>

              <motion.div className="flex justify-between items-center cursor-pointer">
                <div className="flex items-center gap-2">
                  <LanguageIcon />
                  <span>{t("language")}</span>
                </div>

                <Suspense
                  fallback={<div className="w-16 h-4 bg-gray-300 rounded" />}
                >
                  <LanguageDropdown currentLang={lang} onChange={setLang} />
                </Suspense>
              </motion.div>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ x: 4, color: "#e11d48" }}
              onClick={handleLogOut}
              className="w-full text-start px-4 py-3 flex gap-2 items-center cursor-pointer"
            >
              <LogoutIcon />
              <span>{t("logout")}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      {/* <NotificationIcon /> */}
    </div>
  );
};

export default UserNav;
