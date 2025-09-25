import EduGapLogo from "@/assets/svgs/EduGapLogo.svg?react";
import LoaderAnimationComponent from "./ui/LoaderAnimationComponent";
const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center flex-col justify-center bg-white/70 backdrop-blur-sm z-50">
      <EduGapLogo className="h-62" />
      <LoaderAnimationComponent />
    </div>
  );
};

export default Loader;
