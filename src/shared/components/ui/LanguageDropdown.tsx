import { useClickOutside } from "@/shared/hooks/useClickOutside";
import type { Language } from "@/shared/localization/LanguageContext";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ArrowIcon from "@/assets/svgs/RightArrow.svg?react";

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

type LanguageDropdownProps = {
  currentLang: Language;
  onChange: (lang: Language) => void;
};

const LanguageDropdown = ({ currentLang, onChange }: LanguageDropdownProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(menuRef, () => setOpen(false));

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  };

  return (
    <div
      className="relative inline-block text-left border rounded-2xl border-[#DBDBDB]"
      ref={menuRef}
    >
      {/* Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-gray-700 max-sm:px-1.5 px-3 py-1 rounded-lg flex items-center hover:text-secondary cursor-pointer transition"
      >
        {languages.find((l) => l.code === currentLang)?.label ?? "Select"}

        <motion.span
          className="ms-2 text-sm inline-block"
          animate={{ rotate: open ? 270 : 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ArrowIcon className="w-4 h-4" />
        </motion.span>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.ul
            className="absolute overflow-hidden end-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {languages.map((lang, index) => (
              <li key={lang.code}>
                <button
                  onClick={() => {
                    onChange(lang.code);
                    setOpen(false);
                    queryClient.invalidateQueries();
                  }}
                  className={`block w-full px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    lang.code === currentLang ? "font-bold" : ""
                  } ${
                    languages.length - 1 !== index
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  {lang.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageDropdown;
