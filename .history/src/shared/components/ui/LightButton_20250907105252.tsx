import Arrow from "@/assets/svgs/Arrow.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";

type LightButtonProps = {
  text: string;
  onClick: () => void;
};

const LightButton = ({ text, onClick }: LightButtonProps) => {
  const { lang } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="group mt-4 py-1.5 px-20 rounded-lg w-fit bg-white mx-auto text-lg font-medium shadow-md hover:shadow-xl transition-shadow duration-200 flex items-center justify-center gap-2 overflow-hidden relative cursor-pointer"
    >
      {text}
      <Arrow
        className={`w-6 h-6 absolute end-8 transition-transform duration-200 group-hover:translate-x-1 ${
          lang === "en" ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

export default LightButton;
