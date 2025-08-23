import RightArrow from "@/assets/svgs/RightArrow.svg?react";
import { Link } from "react-router";
type ArrowProps = {
  to: string;
  buttonText: string;
};

function GhostButton({ buttonText, to }: ArrowProps) {
  return (
    <Link
      to={to}
      className={`cursor-pointer underline text-secondary  
         text-secondary`}
    >
      {buttonText}
      <RightArrow className="rotate-180" />
    </Link>
  );
}

export default GhostButton;
