import EduGapLogo from "@/assets/svgs/EduGapLogo.svg?react";
import LoaderAnimationComponent from "./ui/LoaderAnimationComponent";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center space-y-8">
        <EduGapLogo className="h-20" />
        <LoaderAnimationComponent />
      </div>
    </div>
  );
};

export default Loader;
