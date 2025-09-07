import { useState } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
];

type LanguageDropdownProps = {
  currentLang: string;
  onChange: (lang: string) => void;
};

const LanguageDropdown = ({ currentLang, onChange }: LanguageDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {/* Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-gray-700 px-3 py-1 rounded-lg shadow-sm hover:text-secondary cursor-pointer transition"
      >
        {languages.find((l) => l.code === currentLang)?.label ?? "Select"}
        <span className="ml-2">▼</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul className="absolute mt-2 w-40 bg-white border border-secondary overflow-hidden rounded-lg shadow-lg z-50">
          {languages.map((lang, index) => (
            <li key={lang.code}>
              <button
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  lang.code === currentLang ? "font-bold" : ""
                }
                ${
                  languages?.length - 1 != index &&
                  "border-b-1 border-secondary"
                }
                `}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageDropdown;
