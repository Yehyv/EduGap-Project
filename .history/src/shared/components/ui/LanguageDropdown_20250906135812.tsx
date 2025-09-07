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
        className="tw-bg-gray-100 tw-text-gray-700 tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm hover:tw-bg-gray-200 tw-transition"
      >
        {languages.find((l) => l.code === currentLang)?.label ?? "Select"}
        <span className="tw-ml-2">▼</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul className="absolute tw-mt-2 tw-w-40 tw-bg-white tw-border tw-rounded-lg tw-shadow-lg tw-z-50">
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
                className={`tw-block tw-w-full tw-text-left tw-px-4 tw-py-2 hover:tw-bg-gray-100 ${
                  lang.code === currentLang ? "tw-font-bold" : ""
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
