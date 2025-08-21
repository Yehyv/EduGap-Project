import InnovaLogo from "@/assets/svgs/InnovaLogo2.svg?react";
const InnovaFooter = () => {
  return (
    <footer className="text-white text-lg bg-secondary text-center center items-center relative min-h-[60px]">
      <div> بواسطة شركة Innovadigit Solutions App </div>
      <InnovaLogo className="h-[60px] absolute left-20" />
    </footer>
  );
};

export default InnovaFooter;
