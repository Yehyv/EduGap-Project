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
        bg-primary text-white p-2 h-[80px] w-10 shadow-md 
        hover:bg-gray-600 transition
        ${isLeft ? "-left-15" : "-right-15"}
      `}
    >
      {isLeft ? <RightArrow className="rotate-180" /> : <RightArrow />}
    </button>
  );
}

export default ArrowButton;
