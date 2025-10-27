import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
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
        <div className="text-end">
          <Link
            className="border rounded-xl px-4 py-1 text-secondary border-secondary transform transition-transform duration-400 hover:-translate-y-0.5 inline-block"
            to="/program-details/1"
          >
            {t("eductaion_button")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProgramsSectionCard;
