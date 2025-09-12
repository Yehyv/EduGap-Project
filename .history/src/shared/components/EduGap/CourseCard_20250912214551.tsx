import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import InstructorAvatar from "@/assets/svgs/InstructorAvatar.svg";
import DefaultButton from "../ui/DefaultButton";
import type { CourseType } from "@/shared/types/sharedTypes";
import CourseCardOverlayDetails from "./CourseCardOverlayDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import LevelBadge from "../ui/LevelBadge";

const CourseCard = ({ course }: { course: CourseType }) => {
  const { t } = useLanguage();
  return (
    <div
      className="group relative bg-white rounded-xl shadow-custom overflow-hidden
         w-full my-5 transition-all duration-300 ease-in-out
        hover:-translate-y-2"
    >
      {/* Image Section */}
      <div className=" overflow-hidden rounded-xl">
        <img
          src={course.image || InstructorAvatar}
          alt={course?.name}
          className="w-full object-contain max-h-[180px]"
          onError={(e) => {
            e.currentTarget.src = InstructorAvatar;
          }}
        />

        <MedalIcon className="absolute top-2 end-2" />
        <LevelBadge level={course?.levelName ?? "Mid"} />
      </div>

      {/* Content Section */}
      <div className="p-2 pt-2">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <p className="text-sm font-semibold text-gray-400">
              {/* Category */}
              Category
            </p>
            <h5
              className="font-semibold text-gray-800 line-clamp-1"
              title={course?.name}
            >
              {course?.name}
            </h5>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-400">
          {course.educators?.[0]?.title} / {course.educators?.[0]?.firstName}{" "}
          {course.educators?.[0]?.lastName}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="me-1">{course?.rate?.toFixed(1)}</span>
            {[...Array(course.rate)].map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="text-gray-400 text-sm ms-2">
            {/* ({course?.reviews?.toLocaleString()}) */}
            (5000)
          </span>
        </div>

        <div className="flex max-sm:gap-4 justify-center relative z-20">
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

      {/* Overlay Details */}
      <CourseCardOverlayDetails course={course} />
    </div>
  );
};

export default CourseCard;
