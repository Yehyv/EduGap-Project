import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import LearningPathEnrollButton from "@/features/UserHome/components/LearningPathEnrollButton";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { ProgramsType } from "@/shared/types/sharedTypes";
import { Link } from "react-router-dom";

const ProgramsSectionCard = ({ data }: { data: ProgramsType }) => {
  const { t } = useLanguage();

  return (
    <div
      className={`bg-white flex max-sm:flex-col rounded-2xl shadow-custom overflow-hidden flex-row my-5 mx-1`}
    >
      {/* Image Section */}
      <div className="w-1/2 relative max-sm:w-full h-[220px]">
        <img className="w-full h-full object-contain" src={data?.image} />
        <div className="absolute start-2 bottom-2 bg-white rounded-lg px-1 py-0.5 text-sm">
          <VideoIcon className="inline-block" />
          <span className="inline-block mx-1">{data?.contentsCount ?? 0}</span>
          <span>{t("courses")}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full p-4 flex flex-col">
        <h3 className="mb-4">{data?.title}</h3>
        <p className="line-clamp-5 mb-5 flex-1" title={data?.description}>
          {data.description}
        </p>
        <div className="flex gap-2 items-center justify-end">
          <LearningPathEnrollButton
            isEnrolled={data?.isEnrolled ?? false}
            programId={data?.id}
            queryKeyToReCall={[
              "educationProgramsForSlider",
              "getGuestProgramsList",
            ]}
          />
          <Link
            className="rounded-xl px-4 py-1 bg-[#FCB737] font-bold text-black transform transition-transform duration-300 hover:!text-black hover:-translate-y-0.5 inline-block no-underline"
            to={`/program-details/${data?.id}`}
          >
            {t("eductaion_button")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProgramsSectionCard;
