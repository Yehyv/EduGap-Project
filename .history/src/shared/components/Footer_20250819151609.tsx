import InnovaLogo from "@/assets/svgs/InnovaLogo.svg?react";
const Footer = () => {
  return (
    <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600 flex">
      <div>© {new Date().getFullYear()} My App. All rights reserved.</div>
      <InnovaLogo className="w-32 " />
    </footer>
  );
};

export default Footer;
