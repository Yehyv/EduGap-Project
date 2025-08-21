import RightArrow from "@/assets/svgs/RightArrow.svg?react";
type ArrowProps = {
  direction: "left" | "right";
  onClick?: () => void;
};

function ArrowButton({ direction, onClick }: ArrowProps) {
  const isLeft = direction === "left";

  return (
    <button
      onClick={onClick}
      className={`
        absolute top-1/2 cursor-pointer -translate-y-1/2 
        bg-primary text-white p-1 rounded-2xl h-[10px]  shadow-md 
        hover:bg-gray-600 transition
        ${isLeft ? "-left-15" : "-right-15"}
      `}
    >
      {isLeft ? <RightArrow className="rotate-180" /> : <RightArrow />}
    </button>
  );
}

export default ArrowButton;
