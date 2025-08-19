import LogoSm from "@/assets/svgs/LogoSm.svg?react";

const Header = () => {
  return (
    <header className="bg-white shadow p-2" dir="ltr">
      <div className="container mx-auto flex items-center justify-between">
        {/* <MainLogo className="w-32" /> */}
        <LogoSm
          viewBox="0 0 126 50"
          className="tw-h-auto tw-w-[10px]" // العرض الافتراضي متناسب مع 60 ارتفاع
        />
        <nav className="space-x-4">
          <a href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </a>
          <a href="/about" className="text-gray-700 hover:text-blue-600">
            About
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
