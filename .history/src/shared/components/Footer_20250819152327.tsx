import InnovaLogo from "@/assets/svgs/InnovaLogo_optimized.svg?react";
const Footer = () => {
  return (
    <footer className="relative p-4 text-white text-lg text-center center items-center bg-secondary ">
      <div> بواسطة شركة Innovadigit Solutions App </div>
      <InnovaLogo className="w-10 absolute top-0 start-0" />
    </footer>
  );
};

export default Footer;
