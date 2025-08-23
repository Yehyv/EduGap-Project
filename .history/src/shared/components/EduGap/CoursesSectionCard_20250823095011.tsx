import InstructorImage from "@/assets/imgs/ForDev/InstructorImage.png";
import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import VolumeIcon from "@/assets/svgs/VolumeIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import DefaultButton from "../ui/DefaultButton";
import type { CourseTypes } from "@/shared/types/courses";
import TitileLine from "@/assets/svgs/TitileLine.svg?react";
import CheckIcon from "@/assets/svgs/CheckIcon.svg?react";
import TimeLeftIcon from "@/assets/svgs/TimeLeftIcon.svg?react";

const CoursesSectionCard = ({ course }: { course: CourseTypes }) => {
  return (
    <div className="bg-white flex">
      <div className="w-1/3"></div>
      <div className="w-full"></div>
    </div>
  );
};

export default CoursesSectionCard;
