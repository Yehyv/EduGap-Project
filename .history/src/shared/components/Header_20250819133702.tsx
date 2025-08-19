import HeaderLogo from "@/assets/svgs/HeaderLogo.svg?react";
import MainLogo from "@/assets/svgs/MainLogo";

const Header = () => {
  return (
    <header className="bg-white shadow p-4" dir="ltr">
      <div className="container mx-auto flex items-center justify-between">
        <MainLogo className="w-32" />
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
