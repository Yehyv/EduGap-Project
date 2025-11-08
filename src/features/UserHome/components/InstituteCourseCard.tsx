import type { InstituteCoursesType } from "@/shared/types/sharedTypes";
import { useLanguage } from "@/shared/localization/useLanguage";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import courseImage from "@/assets/imgs/ForDev/CourseInsitituteImage.png";
import { Link } from "react-router-dom";

const InstituteCourseCard = ({ course }: { course: InstituteCoursesType }) => {
  const { t } = useLanguage();

  return (
    <div
      className="group relative bg-white rounded-xl shadow-custom overflow-hidden
       w-full transition-all duration-300 ease-in-out
       hover:-translate-y-2 my-3"
    >
      {/* Image Section */}
      <div className="relative">
        <img
          src={course.image || courseImage}
          alt={course?.name}
          className="w-full h-[200px] object-cover"
          onError={(e) => {
            e.currentTarget.src = courseImage;
          }}
        />
        <Link
          to={`/institute-course-details/${course.id}`}
          className="absolute -bottom-[20px] w-[90%] h-[40px] bg-[#DEF4FF] left-1/2 -translate-x-1/2 rounded-lg center text-secondary font-bold text-sm p-1 shadow-custom"
        >
          {course?.name}
        </Link>
      </div>

      {/* Content Section */}
      <div className=" p-2 flex-1 text-sm px-6 mt-7">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div>{course?.totalDuration}</div>
            <TimeIcon className="h-4" />
          </div>
          <div className="flex items-center gap-2">
            <div>
              {course?.contentsCount} {t("courses")}
            </div>
            <VideoIcon className="w-5" />
          </div>
        </div>
        <p className="text-gray-500">{course?.description}</p>
        <Link
          to={`/institute-course-details/${course.id}`}
          className="text-secondary cursor-pointer"
        >
          {t("more")}..
        </Link>
      </div>
    </div>
  );
};

export default InstituteCourseCard;
