import RightArrow from "@/assets/svgs/RightArrow.svg?react";
import { Link } from "react-router";
type ArrowProps = {
  direction: "left" | "right";
  onClick?: () => void;
};

function ArrowButton({ direction, to }: ArrowProps) {
  const isLeft = direction === "left";

  return (
    <Link
      to={to}
      className={`cursor-pointer underline  
         text-secondary ${isLeft ? "-left-15" : "-right-15"}
      `}
    >
      {}
      <RightArrow className="rotate-180" />
    </Link>
  );
}

export default ArrowButton;
