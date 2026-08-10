import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { Language } from "@/shared/localization/LanguageContext";
import LanguageDropdown from "@/shared/components/ui/LanguageDropdown";
import PersonIcon from "@/assets/imgs/Profile.png";
import ArrowIcon from "@/assets/svgs/RightArrow.svg?react";

interface ProfileSectionProps {
  userName: string;
  userRole: string;
  userImage?: string;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

const ProfileSection = ({
  userName,
  userRole,
  userImage,
  currentLang,
  onLanguageChange,
}: ProfileSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLanguage();

  useClickOutside(sectionRef, () => setIsOpen(false));

  // Animation variants for the absolute positioned dropdown
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeIn" },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  return (
    <div ref={sectionRef} className="relative">
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-[#F5F5F5] mx-2 px-2 py-1 rounded-lg flex items-center gap-3 text-sm cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      >
        <img
          src={userImage ? userImage : PersonIcon}
          alt={userName}
          className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 overflow-hidden max-sm:hidden px-2 text-start min-w-0">
          <h5 className="font-medium truncate">{userName}</h5>
          <span className="text-[#ACACAC] truncate block">{userRole}</span>
        </div>

        {/* Arrow Indicator */}
        <motion.span
          className="flex-shrink-0 max-sm:hidden"
          animate={{ rotate: isOpen ? 270 : 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ArrowIcon className="w-5" />
        </motion.span>
      </button>

      {/* Absolute Positioned Dropdown - Won't affect header height */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-full end-0 mt-2 w-72 z-50"
          >
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              {/* User Info Section (visible on mobile when dropdown is open) */}
              <div className="sm:hidden mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img
                    src={PersonIcon}
                    alt={userName}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{userRole}</p>
                  </div>
                </div>
              </div>

              {/* Language Toggle Section */}
              <div className="space-y-3">
                <h6 className="text-sm font-semibold text-gray-700">
                  {t("languageSettings")}
                </h6>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("selectLanguage")}
                  </span>
                  <LanguageDropdown
                    currentLang={currentLang}
                    onChange={onLanguageChange}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSection;
