import GhostButton from "../ui/GhostButton";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { ProgramsType } from "@/shared/types/sharedTypes";

const ProgramsSectionCard = ({ data }: { data: ProgramsType }) => {
  const { t, lang } = useLanguage();

  return (
    <div
      className={`bg-white flex rounded-2xl shadow-custom overflow-hidden my-5 mx-1 ${
        lang === "ar" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Image Section */}
      <div className="w-1/2 relative">
        <img className="w-full h-full object-cover" src={CourseSection} />
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
