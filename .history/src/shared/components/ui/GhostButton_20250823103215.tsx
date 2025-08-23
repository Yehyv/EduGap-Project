import ThinArrowButton from "@/assets/svgs/ThinArrowButton.svg?react";
import { Link } from "react-router";

type ArrowProps = {
  to: string;
  buttonText: string;
};

function GhostButton({ buttonText, to }: ArrowProps) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center cursor-pointer text-secondary hover:text-secondary/90 relative"
    >
      {/* النص + underline متحركة */}
      <span className="relative me-2">
        {buttonText}
        <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-secondary transition-all duration-300 group-hover:w-full" />
      </span>

      {/* السهم */}
      <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1 group-hover:animate-wiggle">
        <ThinArrowButton />
      </span>
    </Link>
  );
}

export default GhostButton;
