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
      className="group inline-flex items-center cursor-pointer text-secondary hover:text-secondary/90"
    >
      <span className="relative me-2 border-1">
        {buttonText}
        <span className="absolute start-0 -bottom-0.5 h-[1px] w-full bg-secondary transition-all duration-300 group-hover:w-full" />
      </span>

      <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">
        <ThinArrowButton />
      </span>
    </Link>
  );
}

export default GhostButton;
