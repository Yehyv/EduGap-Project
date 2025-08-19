import InnovaLogo from "@/assets/svgs/InnovaLogo.svg?react";
const Footer = () => {
  return (
    <footer className="p-4 text-center text-sm flex items-center bg-secondary ">
      <div>© {new Date().getFullYear()} My App. All rights reserved.</div>
      <InnovaLogo className="w-32 " />
    </footer>
  );
};

export default Footer;
