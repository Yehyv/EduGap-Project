import RightArrow from "@/assets/svgs/RightArrow.svg?react";
type ArrowProps = {
  direction: "left" | "right";
  onClick?: () => void;
  bgColor?: string;
  disabled?: boolean;
};

function ArrowButton({
  direction,
  onClick,
  bgColor = "#F0F0F0",
  disabled,
}: ArrowProps) {
  const isLeft = direction === "left";

  return disabled ? (
    <> </>
  ) : (
    <button
      onClick={onClick}
      style={{ backgroundColor: bgColor }}
      className={`
        absolute top-1/2 cursor-pointer -translate-y-1/2 
        bg-[#F0F0F0] text-white p-1 rounded-2xl h-[100px]  shadow-md 
        hover:bg-[#F0F0F0]/50 transition
        ${isLeft ? "-left-15" : "-right-15"}
      `}
    >
      {isLeft ? <RightArrow className="rotate-180" /> : <RightArrow />}
    </button>
  );
}

export default ArrowButton;
