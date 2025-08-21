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
        absolute top-1/2 -translate-y-1/2 
        bg-gray-800 text-white p-2 rounded-full shadow-md 
        hover:bg-gray-600 transition
        ${isLeft ? "left-0" : "right-2"}
      `}
    >
      {isLeft ? <RightArrow /> : <RightArrow />}
    </button>
  );
}

export default ArrowButton;
