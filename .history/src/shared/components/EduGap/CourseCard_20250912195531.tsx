import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import VolumeIcon from "@/assets/svgs/VolumeIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import DefaultButton from "../ui/DefaultButton";
import type { CourseType } from "@/shared/types/sharedTypes";
import CourseCardOverlayDetails from "./CourseCardOverlayDetails";

const CourseCard = ({ course }: { course: CourseType }) => {
  return (
    <div
      dir="auto"
      className="group relative bg-white rounded-xl shadow-custom overflow-hidden
         w-full my-5 transition-all duration-300 ease-in-out
        hover:-translate-y-2"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={
            course.image ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt={course?.name}
          className="w-full object-cover max-h-[200px]"
          onError={(e) => {
            e.currentTarget.src =
              "https://cdn-icons-png.flaticon.com/512/149/149071.png";
          }}
        />

        <MedalIcon className="absolute top-2 end-2" />
        <div className="absolute center bottom-0 w-full h-5 bg-primary flex items-center gap-2 px-2">
          <VolumeIcon />
          <span className="text-secondary text-sm">مبتدئ</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2 pt-2">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <p className="text-sm font-semibold text-gray-400">
              {course?.name}
            </p>
            <h5
              className="font-semibold text-gray-800 line-clamp-1"
              title={course?.description}
            >
              {course?.description}
            </h5>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-400">عبدالله شعبان</p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="me-1">{course?.rating?.toFixed(1)}</span>
            {[...Array(4)].map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="text-gray-400 text-sm ms-2">
            {/* ({course?.reviews?.toLocaleString()}) */}
            (2404)
          </span>
        </div>

        <div className="flex justify-center relative z-20">
          <DefaultButton
            text="ابدأ التعلم"
            onClick={() => {}}
            type="button"
            moreStyle="min-w-[150px] rounded-3xl !py-1"
          />
          <button
            type="button"
            className="absolute end-0 cursor-pointer"
            onClick={() => {}}
          >
            <SaveIcon />
          </button>
        </div>
      </div>

      {/* Overlay Details */}
      <CourseCardOverlayDetails course={course} />
    </div>
  );
};

export default CourseCard;
