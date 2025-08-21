import InnovaLogo from "@/assets/svgs/InnovaLogo2.svg?react";
const InnovaFooter = () => {
  return (
    <footer className="text-[#E0DEDE] text-lg bg-secondary text-center center items-center relative min-h-[60px]">
      <div> بواسطة شركة Innovadigit Solutions App </div>
      <InnovaLogo className="h-[50px] absolute left-20" />
    </footer>
  );
};

export default InnovaFooter;
