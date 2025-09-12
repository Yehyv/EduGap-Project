import VolumeIcon from "@/assets/svgs/VolumeIcon.svg?react";
import TitileLine from "@/assets/svgs/TitileLine.svg?react";
import CheckIcon from "@/assets/svgs/CheckIcon.svg?react";
import TimeLeftIcon from "@/assets/svgs/TimeLeftIcon.svg?react";
import type { CourseType } from "@/shared/types/sharedTypes";

const CourseCardOverlayDetails = ({ course }: { course: CourseType }) => {
  return (
    <div
      className="h-full
          absolute rounded-2xl inset-0 z-10 bg-white/95 backdrop-blur-sm
          opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-300
          p-4 flex flex-col gap-3 overflow-hidden
          pointer-events-auto
        "
    >
      {/* Title & Instructor */}
      <div>
        <h3
          title={course?.name}
          className="font-semibold line-clamp-1 text-secondary text-lg leading-tight mb-1"
        >
          {course?.name}
        </h3>
        <p className="text-sm font-medium text-gray-500">
          {/* {course?.instructor} */}
          عبدالله شعبان
        </p>
      </div>

      {/* Info Row */}
      <div className="flex gap-4 text-sm text-gray-600">
        <div>
          <TimeLeftIcon className="inline-block me-1" />
          <span>1 ساعة 50 دقيقة / 12 درس</span>
        </div>
        <div>
          <VolumeIcon className="!text-black inline-block me-2" />
        </div>
      </div>

      {/* Divider */}
      {/* <div className="h-[1px] bg-gray-300 w-full"></div> */}

      {/* What you'll learn */}
      <div className="h-full mb-10 overflow-y-auto">
        <h6 className="text-sm font-semibold mb-1">ماذا ستتعلم</h6>
        <TitileLine className="w-14 -mt-2" />
        <ul className="space-y-2 pr-1 text-sm text-gray-700">
          {[...Array(10)].map((_, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckIcon className="mt-1 shrink-0" />
              <span>
                تتعرف على أسس الذكاء الاصطناعي في التسويق، وتتعلم كيفية استخدام
                البيانات والتحليلات الذكية في تحسين استراتيجيات التسويق.
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseCardOverlayDetails;
