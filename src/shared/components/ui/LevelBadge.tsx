import VolumeIcon from "@/assets/svgs/VolumeIcon.svg?react";
import type { LevelName } from "@/shared/types/sharedTypes";

const levelColors: Record<LevelName, string> = {
  Beginner: "bg-[#D1FFD3] text-[#056B01]",
  Mid: "bg-[#F8DCFD] text-[#8800A9]",
  Advanced: "bg-[#017BBC] text-[#EAF8FF]",
};

const LevelBadge = ({ level }: { level?: LevelName }) => {
  return (
    <div
      className={`absolute center bottom-0 w-full h-5 flex items-center gap-2 px-2 ${
        levelColors[level ?? "Mid"]
      }`}
    >
      <VolumeIcon />
      {level}
    </div>
  );
};
export default LevelBadge;
