import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import InstructorAvatar from "@/assets/svgs/InstructorAvatar.svg";
import DefaultButton from "../ui/DefaultButton";
import type { CourseType } from "@/shared/types/sharedTypes";
import { useLanguage } from "@/shared/localization/useLanguage";
import LevelBadge from "../ui/LevelBadge";

const ContinueWhereLeftOffCard = ({ course }: { course: CourseType }) => {
  const { t } = useLanguage();

  return (
    <div
      className="group relative bg-white rounded-xl shadow-custom overflow-hidden
     w-full transition-all duration-300 ease-in-out
     hover:-translate-y-2 my-3"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={course.image || InstructorAvatar}
          alt={course?.name}
          className="w-full h-[180px] object-contain"
          onError={(e) => {
            e.currentTarget.src = InstructorAvatar;
          }}
        />

        <MedalIcon className="absolute top-2 end-2" />
        <LevelBadge level={course?.levelName ?? "Mid"} />
      </div>

      {/* Content Section */}
      <div className="p-2 pt-2 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <h5
              className="font-semibold text-gray-800 line-clamp-1"
              title={course?.name}
            >
              {course?.name}
            </h5>
            <div>
              <div className="text-sm font-semibold text-gray-400">
                {course?.category?.name}
              </div>
              <div className="text-sm font-semibold text-gray-400">
                {course?.category?.name}
              </div>
            </div>
          </div>
        </div>

        <div className="flex mt-auto max-sm:gap-4 justify-center relative z-20">
          <button
            type="button"
            className="absolute max-sm:static end-0 cursor-pointer"
            onClick={() => {}}
          >
            <SaveIcon />
          </button>
          <DefaultButton
            text={t("start_learning")}
            onClick={() => {}}
            type="button"
            moreStyle="min-w-[150px] rounded-3xl !py-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ContinueWhereLeftOffCard;
