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

const CourseCard = ({ course }: { course: CourseTypes }) => {
  return (
    <div
      dir="auto"
      className="
        group relative bg-white mx-1 rounded-xl shadow-custom overflow-hidden
        max-w-[280px] w-full mb-2 mt-2 transition-all duration-300 ease-in-out
        hover:-translate-y-2
      "
    >
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={course?.image || InstructorImage}
          alt={course?.title}
          className="w-full object-cover"
        />
        <MedalIcon className="absolute top-2 end-2" />
        <div className="absolute center bottom-0 w-full h-5 bg-primary flex items-center gap-2 px-2">
          <VolumeIcon />
          <span className="text-secondary text-sm">{course?.level}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2 pt-2">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <p className="text-sm font-semibold text-gray-400">
              {course?.category}
            </p>
            <div className="flex items-center justify-between">
              <h5
                className="font-semibold text-gray-800 line-clamp-1"
                title={course?.title}
              >
                {course?.title}
              </h5>
              <SaveIcon />
            </div>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-400">
          {course?.instructor}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="me-1">{course?.rating?.toFixed(1)}</span>
            {[...Array(4)].map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="text-gray-400 text-sm ms-2">
            ({course?.reviews?.toLocaleString()})
          </span>
        </div>

        <div className="flex justify-center relative z-20">
          <DefaultButton
            text="ابدأ التعلم"
            onClick={() => {}}
            type="button"
            moreStyle="min-w-[150px] rounded-3xl !py-1"
          />
        </div>
      </div>

      {/* Overlay Details */}
      <div
        className="
          absolute inset-0 z-10 bg-white/95 backdrop-blur-sm
          opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-300
          p-4 flex flex-col gap-3 overflow-hidden
          pointer-events-auto
        "
      >
        {/* Title & Instructor */}
        <div>
          <h3
            title={course?.title}
            className="font-semibold line-clamp-1 text-secondary text-lg leading-tight mb-1"
          >
            {course?.title}
          </h3>
          <p className="text-sm font-medium text-gray-500">
            {course?.instructor}
          </p>
        </div>

        {/* Info Row */}
        <div className="flex gap-4 text-sm text-gray-600">
          <div>
            <TimeLeftIcon className="inline-block me-1" />
            <span>1 ساعة 50 دقيقة / 12 درس</span>
          </div>
          <div>
            <span>عام</span>
            <VolumeIcon className="text-black" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gray-300 w-full"></div>

        {/* What you'll learn */}
        <div>
          <h6 className="text-sm font-semibold mb-1">ماذا ستتعلم</h6>
          <TitileLine className="w-14 -mt-2" />
          <ul className="space-y-2 max-h-[130px] overflow-y-auto pr-1 text-sm text-gray-700">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckIcon className="mt-1 shrink-0" />
                <span>
                  تتعرف على أسس الذكاء الاصطناعي في التسويق، وتتعلم كيفية
                  استخدام البيانات والتحليلات الذكية في تحسين استراتيجيات
                  التسويق.
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
