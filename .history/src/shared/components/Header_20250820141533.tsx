import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import { Link } from "react-router";
import DefaultButton from "./ui/DefaultButton";

const Header = () => {
  return (
    <header className="bg-primary py-1" dir="ltr">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <LogoSm className="mb-2" />
        <div className="relative text-gray-600" dir="rtl">
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
        <nav className="flex gap-4">
          <Link to="/">الدورات التدريبية</Link>
          <Link to="/">برامج التعلم</Link>
          <Link to="/">الخبراء</Link>
        </nav>
        <div className="flex gap-4 items-center">
          <Link to="/">تسجيل الدخول</Link>
          <DefaultButton
            text="اشتراك"
            type="reset"
            moreStyle="px-6 py-1"
            onClick={() => {}}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
