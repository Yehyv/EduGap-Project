import { useState } from "react";
import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import { Link } from "react-router";
import DefaultButton from "./ui/DefaultButton";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-primary py-2" dir="ltr">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <LogoSm className="mb-1 w-20 sm:w-24" />

        {/* Search Bar (hidden on mobile) */}
        <div className="relative hidden md:block text-gray-600" dir="rtl">
          <input
            className="border min-xl:w-[400px] border-[#8A8A8A] h-10 px-2 pr-10 rounded-lg text-sm focus:outline-none"
            type="search"
            name="search"
            placeholder="بحث"
          />
          <button type="submit" className="absolute right-0 top-0 mt-2 ms-2">
            <SearchIcon />
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-white">
          <Link to="/">الدورات التدريبية</Link>
          <Link to="/">برامج التعلم</Link>
          <Link to="/">الخبراء</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex gap-4 items-center text-white">
          <Link to="/">تسجيل الدخول</Link>
          <DefaultButton
            text="اشتراك"
            type="button"
            moreStyle="px-6 !py-1"
            onClick={() => {}}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden  cursor-pointer focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <span className="text-2xl">&times;</span> // ×
          ) : (
            <span className="text-2xl">&#9776;</span> // ☰
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-primary text-white px-4 py-3 space-y-3">
          <div className="relative text-gray-600" dir="rtl">
            <input
              className="border w-full border-[#8A8A8A] h-10 px-2 pr-10 rounded-lg text-sm focus:outline-none"
              type="search"
              name="search"
              placeholder="بحث"
            />
            <button type="submit" className="absolute right-0 top-0 mt-2 ms-2">
              <SearchIcon />
            </button>
          </div>
          <nav className="flex flex-col gap-3">
            <Link to="/">الدورات التدريبية</Link>
            <Link to="/">برامج التعلم</Link>
            <Link to="/">الخبراء</Link>
          </nav>
          <div className="flex flex-col gap-3">
            <Link to="/">تسجيل الدخول</Link>
            <DefaultButton
              text="اشتراك"
              type="button"
              moreStyle="px-6 !py-1 w-full"
              onClick={() => {}}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
