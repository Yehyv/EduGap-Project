import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";

const Header = () => {
  return (
    <header className="bg-primary shadow py-1" dir="ltr">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <LogoSm className="mb-2" />
        <div className="relative mx-auto text-gray-600" dir="rtl">
          <input
            className="border border-[#8A8A8A] h-10 px-2 pr-10 rounded-lg text-sm focus:outline-none"
            type="search"
            name="search"
            placeholder="بحث"
          />
          <button type="submit" className="absolute right-0 top-0 mt-2 ms-2">
            <SearchIcon />
          </button>
        </div>
        <nav className="space-x-4">
          <a href="/" className="text-gray-700 hover:text-blue-600">
            الدورات التدريبية
          </a>
          <a href="/about" className="text-gray-700 hover:text-blue-600">
            برامج التعلم
          </a>
          <a href="/about" className="text-gray-700 hover:text-blue-600">
            الخبراء
          </a>
        </nav>
        <div>
          <a href="/about" className="text-gray-700 hover:text-blue-600">
            تسجيل الدخول
          </a>
          <button>اشتراك</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
