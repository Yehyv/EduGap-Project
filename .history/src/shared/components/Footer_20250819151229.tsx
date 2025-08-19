import InnovaLogo from "@/assets/svgs/InnovaLogo.svg?react";
const Footer = () => {
  return (
    <div
      className={`relative start-0 end-0 z-10 bottom-0 bg-secondary flex items-center justify-center`}
    >
      <div className="flex md:gap-1 flex-col md:flex-row text-center">
        <div> تصميم وتنفيذ شركة</div>
        <p className={""}>Innovadigit Solutions App </p>
      </div>
      <InnovaLogo className="w-20" />
    </div>
  );
};

export default Footer;
