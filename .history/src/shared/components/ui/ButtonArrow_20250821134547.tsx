import RightArrow from "@/assets/svgs/RightArrow.svg?react";
type ArrowProps = {
  direction: "left" | "right";
  onClick?: () => void;
};

function Arrow({ direction, onClick }: ArrowProps) {
  const isLeft = direction === "left";

  return (
    <button
      onClick={onClick}
      className={`
        tw-absolute tw-top-1/2 -tw-translate-y-1/2 
        tw-bg-gray-800 tw-text-white tw-p-2 tw-rounded-full tw-shadow-md 
        hover:tw-bg-gray-600 tw-transition
        ${isLeft ? "tw-left-2" : "tw-right-2"}
      `}
    >
      {isLeft ? <RightArrow /> : <RightArrow />}
    </button>
  );
}

export default Arrow;
