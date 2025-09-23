import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import NavListIcon from "@/assets/svgs/NavListIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import { Link } from "react-router";
import DefaultButton from "./ui/DefaultButton";
import { useState } from "react";
import UserNav from "./UserNav";
import LanguageDropdown from "./ui/LanguageDropdown";
import { useLanguage } from "../localization/useLanguage";

const Header = ({ isLoggedIn = false }: { isLoggedIn?: boolean }) => {
  const { t, lang, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={`${
        isLoggedIn ? "bg-white" : "bg-primary"
      } py-2 z-50 sticky start-0 end-0 top-0`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4">
        {/* Logo */}
        <LogoSm className="w-24" />

        {/* Search */}
        <div className="relative text-gray-600 flex-1 max-w-xs sm:max-w-md md:max-w-lg">
          <input
            className="border border-[#8A8A8A] w-full h-10 px-2 pr-10 rounded-lg text-sm focus:outline-none"
            type="search"
            name="search"
            placeholder={t("search_placeholder")}
            dir={lang === "ar" ? "rtl" : "ltr"}
          />
          <button type="submit" className="absolute right-0 top-0 mt-2 mx-2">
            <SearchIcon />
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          <Link to="/">{t("nav_courses")}</Link>
          <Link to="/">{t("nav_programs")}</Link>
          <Link to="/">{t("nav_experts")}</Link>
        </nav>
        {/* Not Auth */}
        {!isLoggedIn && (
          <div className="hidden md:flex gap-4 items-center">
            <Link to="/login">{t("auth_login")}</Link>
            <DefaultButton
              text={t("auth_register")}
              type="reset"
              moreStyle="px-6 !py-1"
              onClick={() => {}}
            />
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex items-center cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <NavListIcon className="h-5 w-5" />
        </button>
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
          <div className="flex justify-between mt-4 gap-3">
            <LanguageDropdown currentLang={lang} onChange={setLang} />
            {!isLoggedIn && (
              <DefaultButton
                text={t("auth_register")}
                type="reset"
                moreStyle="w-[150px] ms-auto !py-1"
                onClick={() => {}}
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
