import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import NavListIcon from "@/assets/svgs/NavListIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import { Link } from "react-router";
import DefaultButton from "./ui/DefaultButton";
import { useState } from "react";
import UserNav from "./UserNav";
import LanguageDropdown from "./ui/LanguageDropdown";
import { useLanguage } from "../localization/useLanguage";

// 🔎 Search input reusable component
const SearchInput = ({
  placeholder,
  lang,
  className = "",
}: {
  placeholder: string;
  lang: string;
  className?: string;
}) => (
  <div className={`relative text-gray-600 ${className}`}>
    <input
      className="border border-[#8A8A8A] w-full h-9 px-3 pr-10 rounded-lg text-sm focus:outline-none"
      type="search"
      name="search"
      placeholder={placeholder}
      dir={lang === "ar" ? "rtl" : "ltr"}
      aria-label={placeholder}
    />
    <button
      type="submit"
      aria-label="Search"
      className="absolute right-2 top-1/2 -translate-y-1/2"
    >
      <SearchIcon className="w-4 h-4" />
    </button>
  </div>
);

const Header = ({ isLoggedIn = false }: { isLoggedIn?: boolean }) => {
  const { t, lang, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={`${
        isLoggedIn ? "bg-white" : "bg-primary"
      } py-2 z-50 sticky start-0 end-0 top-0`}
      dir="ltr"
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4">
        {/* Logo */}
        <LogoSm className="w-24 shrink-0" />

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 justify-center">
          <SearchInput
            placeholder={t("search_placeholder")}
            lang={lang}
            className="max-w-md w-full"
          />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          <Link to="/">{t("nav_courses")}</Link>
          <Link to="/">{t("nav_programs")}</Link>
          <Link to="/">{t("nav_experts")}</Link>
        </nav>

        {/* Auth actions (desktop only) */}
        {!isLoggedIn && (
          <div className="hidden md:flex gap-4 items-center">
            <Link to="/login">{t("auth_login")}</Link>
            <DefaultButton
              text={t("auth_register")}
              type="button"
              moreStyle="px-6 !py-1"
            />
          </div>
        )}

        {/* Language (desktop only) */}
        <div className="hidden md:block">
          <LanguageDropdown currentLang={lang} onChange={setLang} />
        </div>

        {/* Mobile actions */}
        <div className="flex gap-4 items-center md:hidden">
          {isLoggedIn && <UserNav />}
          <button
            className="flex items-center cursor-pointer p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <NavListIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md px-4 mt-2 pt-4 pb-6 space-y-4">
          <nav className="flex flex-col gap-3">
            <Link to="/">{t("nav_courses")}</Link>
            <Link to="/">{t("nav_programs")}</Link>
            <Link to="/">{t("nav_experts")}</Link>
          </nav>
          {!isLoggedIn && <Link to="/login">{t("auth_login")}</Link>}
          <div className="flex justify-between mt-4 gap-2">
            <LanguageDropdown currentLang={lang} onChange={setLang} />
            {!isLoggedIn && (
              <DefaultButton
                onClick={() => {}}
                text={t("auth_register")}
                type="button"
                moreStyle="w-[150px] ms-auto !py-1"
              />
            )}
          </div>
        </div>
      )}

      {/* Mobile Search */}
      <div className="md:hidden mx-4 mt-3">
        <SearchInput
          placeholder={t("search_placeholder")}
          lang={lang}
          className="max-w-md w-full mx-auto"
        />
      </div>
    </header>
  );
};

export default Header;
