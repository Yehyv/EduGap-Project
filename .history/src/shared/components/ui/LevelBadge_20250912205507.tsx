import VolumeIcon from "@/assets/svgs/VolumeIcon.svg?react";
type LevelName = "Beginner" | "Mid" | "Advanced";

const levelColors: Record<LevelName, string> = {
  Beginner: "bg-begginer text-begginer/50",
  Mid: "bg-midLevel text-midLevel/50",
  Advanced: "bg-advanced text-advanced/50",
};

const LevelBadge = ({ level }: { level?: LevelName }) => {
  return (
    <div
      className={`absolute center bottom-0 w-full h-5  flex items-center gap-2 px-2 ${
        levelColors[level ?? "Mid"]
      }`}
    >
      <VolumeIcon />
      {level}
    </div>
  );
};
export default LevelBadge;
