import { lazy, useRef, useState, Suspense } from "react";
import { logoutUser } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "../localization/useLanguage";
import { useClickOutside } from "../hooks/useClickOutside";
import { useUser } from "@/features/auth/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const smoothLazy = <P extends {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  className?: string
): React.FC<P> => {
  const Comp = lazy(importFunc);

  const LazyIcon: React.FC<P> = (props) => (
    <Suspense
      fallback={
        <div className={`w-5 h-5 bg-gray-300 rounded-full ${className}`} />
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={className}
      >
        <Comp {...props} className={className} />
      </motion.div>
    </Suspense>
  );

  return LazyIcon;
};

const UserIcon = smoothLazy(
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
const CoursesIcon = smoothLazy(
  () => import("@/assets/svgs/MyCoursesIcon.svg?react"),
  "w-5 h-5"
);
const CertificateIcon = smoothLazy(
  () => import("@/assets/svgs/CertificateBoldIcon.svg?react"),
  "w-5 h-5"
);
const EditIcon = smoothLazy(
  () => import("@/assets/svgs/EditIcon.svg?react"),
  "w-5 h-5"
);
const LanguageIcon = smoothLazy(
  () => import("@/assets/svgs/LanguageIcon.svg?react"),
  "w-5 h-5"
);
const MoonIcon = smoothLazy(
  () => import("@/assets/svgs/MoonIcon.svg?react"),
  "w-5 h-5"
);
const QuestionIcon = smoothLazy(
  () => import("@/assets/svgs/QuestitionIcon.svg?react"),
  "w-5 h-5"
);
const LogoutIcon = smoothLazy(
  () => import("@/assets/svgs/LogoutIcon.svg?react"),
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
    <div className="flex items-center gap-4 relative" ref={menuRef}>
      {/* Greeting */}
      <div className="text-gray-700 max-xl:hidden">
        <span className="me-2">{t("welcome_for_user")}</span>
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
            <div className="flex justify-start gap-4 items-center mx-4">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-11 h-11 bg-primary rounded-full overflow-hidden text-secondary font-bold grid place-items-center mt-4"
              >
                {/* {user?.userName?.[0]} */}
                {user?.userImage ? (
                  <img className="w-full h-full" src={user?.userImage}></img>
                ) : (
                  user?.userName?.[0]
                )}
              </motion.div>
              <div>
                <div className="font-semibold mt-2">{user?.userName}</div>
                <div className="text-sm text-[#797979]">
                  {user?.instituteName}
                </div>
              </div>
              {/* <div className="text-sm text-secondary flex justify-center gap-2 mt-2">
                <span>{t("total_points")}</span>
                <span>400</span>
                <WalletIcon />
              </div> */}
            </div>

            {/* Items */}
            <div className="text-sm mt-3 flex flex-col gap-2 border-b border-t mx-4 border-[#DBDBDB] py-4">
              {[
                { icon: <CoursesIcon />, label: t("my_courses") },
                { icon: <CertificateIcon />, label: t("my_certificates") },
                { icon: <EditIcon />, label: t("edit_profile") },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 4, opacity: 0.9 }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {item.icon}
                  <span>{item.label}</span>
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
              className="w-full text-start text-sm px-4 py-3 flex gap-2 items-center cursor-pointer"
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
