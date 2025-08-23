import RightArrow from "@/assets/svgs/RightArrow.svg?react";
import { Link } from "react-router";
type ArrowProps = {
  to: string;
};

function ArrowButton({ to }: ArrowProps) {
  return (
    <Link
      to={to}
      className={`cursor-pointer underline  
         text-secondary`}
    >
      {}
      <RightArrow className="rotate-180" />
    </Link>
  );
}

export default ArrowButton;
