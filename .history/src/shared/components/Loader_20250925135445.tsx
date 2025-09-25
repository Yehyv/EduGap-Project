import EduGapLogo from "@/assets/svgs/EduGapLogo.svg?react";
const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
      <EduGapLogo />
      {/* <div className="flex items-center justify-center gap-2">
        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-secondary to-secondary-dark animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-secondary to-secondary-dark animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-secondary to-secondary-dark animate-bounce"></span>
      </div> */}
    </div>
  );
};

export default Loader;
