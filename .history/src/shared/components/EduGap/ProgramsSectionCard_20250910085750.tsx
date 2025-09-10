import GhostButton from "../ui/GhostButton";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import type { ProgramsType } from "@/shared/types/sharedTypes";
const ProgramsSectionCard = ({ data }: { data: ProgramsType }) => {
  return (
    <div
      className="bg-white flex rounded-2xl shadow-custom overflow-hidden my-5 mx-1"
      dir="auto"
    >
      <div className="w-1/2 relative">
        <img className="w-full h-full object-cover" src={CourseSection}></img>
        <div className="absolute start-2 bottom-2 bg-white rounded-lg px-1 py-0.5 text-sm">
          <VideoIcon className="inline-block" />
          <span>5 كورسات</span>
        </div>
      </div>
      <div className="w-full p-4 flex">
        <h3 className="mb-4"> {data.name}</h3>
        <p className="line-clamp-5 mb-5  flex-1" title="">
          {data.description}
        </p>
        <div className="text-end">
          <GhostButton to="" buttonText="عرض برنامج التعلم" />
        </div>
      </div>
    </div>
  );
};

export default ProgramsSectionCard;
