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
      className={`
        absolute top-1/2 cursor-pointer underline -translate-y-1/2 
         text-white p-1 rounded-2xl h-[100px] 
         transition
        ${isLeft ? "-left-15" : "-right-15"}
      `}
    >
      {isLeft ? <RightArrow className="rotate-180" /> : <RightArrow />}
    </Link>
  );
}

export default ArrowButton;
