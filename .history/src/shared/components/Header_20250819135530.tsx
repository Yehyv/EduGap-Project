import LogoSm from "@/assets/svgs/LogoSm.svg?react";

const Header = () => {
  return (
    <header className="bg-white shadow p-4" dir="ltr">
      <div className="container mx-auto flex items-center justify-between">
        {/* <MainLogo className="w-32" /> */}
        <div className="relative tw-w-full tw-h-20">
          <div className="absolute tw-inset-0 tw-flex tw-items-center tw-justify-center">
            <LogoSm />
          </div>
        </div>
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
