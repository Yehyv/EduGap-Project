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
        className="text-gray-700 px-3 py-1 rounded-lg shadow-sm hover:bg-gray-200 transition"
      >
        {languages.find((l) => l.code === currentLang)?.label ?? "Select"}
        <span className="ml-2">▼</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul className="absolute mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  lang.code === currentLang ? "font-bold" : ""
                }`}
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
