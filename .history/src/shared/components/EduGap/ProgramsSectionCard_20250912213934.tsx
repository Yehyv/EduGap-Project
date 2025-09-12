import GhostButton from "../ui/GhostButton";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { ProgramsType } from "@/shared/types/sharedTypes";

const ProgramsSectionCard = ({ data }: { data: ProgramsType }) => {
  const { t } = useLanguage();

  return (
    <div
      className={`bg-white flex max-sm:flex-col rounded-2xl shadow-custom overflow-hidden flex-row my-5 mx-1`}
    >
      {/* Image Section */}
      <div className="w-1/2 relative max-sm:w-full max-sm:h-[200px]">
        <img className="w-full h-full object-contain" src={CourseSection} />
        <div className="absolute start-2 bottom-2 bg-white rounded-lg px-1 py-0.5 text-sm">
          <VideoIcon className="inline-block" />
          <span>5 كورسات</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full p-4 flex flex-col">
        <h3 className="mb-4">{data.name}</h3>
        <p className="line-clamp-5 mb-5 flex-1" title={data.description}>
          {data.description}
        </p>
        <div className="text-end">
          <GhostButton to="" buttonText={t("eductaion_button")} />
        </div>
      </div>
    </div>
  );
};

export default ProgramsSectionCard;
