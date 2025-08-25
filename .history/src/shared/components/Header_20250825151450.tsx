import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import { Link } from "react-router";
import DefaultButton from "./ui/DefaultButton";
import { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-primary py-2" dir="ltr">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4">
        {/* Logo */}
        <LogoSm className="w-24" />

        {/* Search */}
        <div
          className="relative text-gray-600 flex-1 max-w-xs sm:max-w-md md:max-w-lg"
          dir="rtl"
        >
          <input
            className="border border-[#8A8A8A] w-full h-10 px-2 pr-10 rounded-lg text-sm focus:outline-none"
            type="search"
            name="search"
            placeholder="بحث"
          />
          <button type="submit" className="absolute right-0 top-0 mt-2 ms-2">
            <SearchIcon />
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          <Link to="/">الدورات التدريبية</Link>
          <Link to="/">برامج التعلم</Link>
          <Link to="/">الخبراء</Link>
        </nav>

        {/* Auth */}
        <div className="hidden md:flex gap-4 items-center">
          <Link to="/">تسجيل الدخول</Link>
          <DefaultButton
            text="اشتراك"
            type="reset"
            moreStyle="px-6 !py-1"
            onClick={() => {}}
          />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "-" : "|"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md px-4 pt-4 pb-6 space-y-4 text-right">
          <nav className="flex flex-col gap-3">
            <Link to="/">الدورات التدريبية</Link>
            <Link to="/">برامج التعلم</Link>
            <Link to="/">الخبراء</Link>
          </nav>
          <div className="flex flex-col gap-3">
            <Link to="/">تسجيل الدخول</Link>
            <DefaultButton
              text="اشتراك"
              type="reset"
              moreStyle="w-[200px] !py-2"
              onClick={() => {}}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
