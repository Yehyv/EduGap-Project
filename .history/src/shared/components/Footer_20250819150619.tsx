import LogoSm from "@/assets/svgs/LogoSm.svg?react";
const Footer = () => {
  return (
    <div
      className={`relative start-0 end-0 z-10 bottom-0 bg-primary flex items-center justify-center`}
    >
      <div className="flex md:gap-1 flex-col md:flex-row text-center">
        <div> تصميم وتنفيذ شركة</div>
        <p className={""}>Innovadigit Solutions App </p>
      </div>
      <LogoSm />
    </div>
  );
};

export default Footer;
