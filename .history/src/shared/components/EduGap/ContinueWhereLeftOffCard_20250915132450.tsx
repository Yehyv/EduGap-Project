import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import InstructorAvatar from "@/assets/svgs/InstructorAvatar.svg";
import type { CourseType } from "@/shared/types/sharedTypes";
import { useLanguage } from "@/shared/localization/useLanguage";
import LevelBadge from "../ui/LevelBadge";

const ContinueWhereLeftOffCard = ({ course }: { course: CourseType }) => {
  const { t } = useLanguage();

  return (
    <div
      className="group relative bg-white rounded-xl shadow-custom overflow-hidden
     w-full transition-all duration-300 ease-in-out
     hover:-translate-y-2 my-3 p-3"
    >
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
            <div className="flex justify-between mt-2">
              <div className="text-sm text-gray-400">
                د/محمد سعيد -دكتور جامعي
              </div>
              <div className="text-sm font-semibold text-yellow-400">4.8</div>
            </div>
          </div>
        </div>
      </div>

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
      </div>

      <div className="flex justify-between text-sm text-secondary my-2">
        <div className="line-clamp-1">الدرس الثاني: كيفية الترويج</div>
        <div className="line-clamp-1">2/23</div>
      </div>
    </div>
  );
};

export default ContinueWhereLeftOffCard;
