import ThinArrowButton from "@/assets/svgs/ThinArrowButton.svg?react";
import { Link } from "react-router";
type ArrowProps = {
  to: string;
  buttonText: string;
};

function GhostButton({ buttonText, to }: ArrowProps) {
  return (
    <Link to={to} className={"cursor-pointer !hover:text-red-700"}>
      <span className="border-b-1 b-secondary p-0.5 me-2">{buttonText}</span>
      <ThinArrowButton className="inline-block" />
    </Link>
  );
}

export default GhostButton;
