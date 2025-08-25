import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import { Link } from "react-router";
import DefaultButton from "./ui/DefaultButton";
import { useState } from "react";
// import { Menu, X } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="tw-bg-primary tw-py-2" dir="ltr">
      <div className="tw-container tw-mx-auto tw-flex tw-items-center tw-justify-between tw-gap-4 tw-px-4">
        {/* Logo */}
        <LogoSm className="tw-w-24" />

        {/* Search */}
        <div
          className="tw-relative tw-text-gray-600 tw-flex-1 tw-max-w-xs sm:tw-max-w-md md:tw-max-w-lg"
          dir="rtl"
        >
          <input
            className="tw-border tw-border-[#8A8A8A] tw-w-full tw-h-10 tw-px-2 tw-pr-10 tw-rounded-lg tw-text-sm focus:tw-outline-none"
            type="search"
            name="search"
            placeholder="بحث"
          />
          <button
            type="submit"
            className="tw-absolute tw-right-0 tw-top-0 tw-mt-2 tw-ms-2"
          >
            <SearchIcon />
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="tw-hidden md:tw-flex tw-gap-6">
          <Link to="/">الدورات التدريبية</Link>
          <Link to="/">برامج التعلم</Link>
          <Link to="/">الخبراء</Link>
        </nav>

        {/* Auth */}
        <div className="tw-hidden md:tw-flex tw-gap-4 tw-items-center">
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
          className="md:tw-hidden tw-flex tw-items-center"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "-" : "|"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:tw-hidden tw-bg-white tw-shadow-md tw-px-4 tw-pt-4 tw-pb-6 tw-space-y-4 tw-text-right">
          <nav className="tw-flex tw-flex-col tw-gap-3">
            <Link to="/">الدورات التدريبية</Link>
            <Link to="/">برامج التعلم</Link>
            <Link to="/">الخبراء</Link>
          </nav>
          <div className="tw-flex tw-flex-col tw-gap-3">
            <Link to="/">تسجيل الدخول</Link>
            <DefaultButton
              text="اشتراك"
              type="reset"
              moreStyle="tw-w-full !tw-py-2"
              onClick={() => {}}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
