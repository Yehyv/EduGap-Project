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
      className={`cursor-pointer underline   
         text-secondary`}
    >
      {buttonText}
      <RightArrow className="rotate-180 !text-secondary" />
    </Link>
  );
}

export default GhostButton;
