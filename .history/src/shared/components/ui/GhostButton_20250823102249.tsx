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
      <span>{buttonText}</span>
      <ThinArrowButton c />
    </Link>
  );
}

export default GhostButton;
