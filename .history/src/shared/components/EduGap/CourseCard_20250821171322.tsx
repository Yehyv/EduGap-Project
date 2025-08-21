import InstructorImage from "@/assets/imgs/ForDev/InstructorImage.png";
import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import VolumeIcon from "@/assets/svgs/VolumeIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import DefaultButton from "../ui/DefaultButton";
import type { CourseTypes } from "@/shared/types/courses";

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

      <div
        className="px-6
          absolute inset-0 z-10
          bg-white backdrop-blur-sm
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          p-3 flex flex-col gap-2
          pointer-events-none
        "
      >
        <h3 className="font-semibold text-secondary text-base m-0">
          {course?.title}
        </h3>
        <p className="text-sm font-semibold text-gray-400">
          {course?.instructor}
        </p>
        <div className="flex justify-between">
          <p className="text-sm">1 ساعة 50 دقيقة /12 درس</p>
          <p className="text-sm">عام</p>
        </div>
        <div className="h-[1px] bg-[#939393] w-full"></div>
        <h6 className="text-lg">ماذا ستتعلم</h6>
      </div>
    </div>
  );
};

export default CourseCard;
