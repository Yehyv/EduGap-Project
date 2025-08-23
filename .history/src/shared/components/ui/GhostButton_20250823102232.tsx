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
      className={`cursor-pointer underline   
         text-secondary`}
    >
      {buttonText}
      <ThinArrowButton className="rotate-180 !text-secondary" />
    </Link>
  );
}

export default GhostButton;
