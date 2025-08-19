import InnovaLogo from "@/assets/svgs/InnovaLogo.svg?react";
const Footer = () => {
  return (
    <footer className="p-4 text-white text-xl text-center flex items-center bg-secondary ">
      <div> بواسطة شركة Innovadigit Solutions App </div>
      <InnovaLogo className="w-32 " />
    </footer>
  );
};

export default Footer;
