import InnovaLogo from "@/assets/svgs/InnovaLogo2.svg?react";
const InnovaFooter = () => {
  return (
    <footer className="text-white text-lg bg-secondary py-4">
      <div className="container text-center center items-center relative">
        <div> بواسطة شركة Innovadigit Solutions App </div>
        <InnovaLogo className="w-[80px] absolute left-0" />
      </div>
    </footer>
  );
};

export default InnovaFooter;
