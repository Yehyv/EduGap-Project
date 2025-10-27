import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import InstructorAvatar from "@/assets/svgs/InstructorAvatar.svg";
import DefaultButton from "../ui/DefaultButton";
import type { CourseType } from "@/shared/types/sharedTypes";
import CourseCardOverlayDetails from "./CourseCardOverlayDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import LevelBadge from "../ui/LevelBadge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

const CourseCard = ({ course }: { course: CourseType }) => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

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

        {course?.isSaved && <MedalIcon className="absolute top-2 end-2" />}
        <LevelBadge level={course?.level ?? "Beginner"} />
      </div>

      {/* Content Section */}
      <div className="p-2 pt-2 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <p className="text-sm font-semibold text-gray-400">
              {/* Category */}
              {course?.name}
            </p>
            <div className="flex justify-between items-center">
              <h5
                className="font-semibold text-gray-800 line-clamp-1"
                title={course?.description}
              >
                {course?.description}
              </h5>
            </div>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-400">
          {course?.educator?.title} / {course?.educator?.name}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="me-1">{course?.rate?.toFixed(1)}</span>

            {(() => {
              const rate = course?.rate ?? 0;
              const fullStars = Math.floor(rate);

              return (
                <>
                  {[...Array(fullStars)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5" />
                  ))}
                </>
              );
            })()}
          </div>

          <span className="text-gray-400 text-sm ms-2">
            ({course?.ratersCount ?? 0})
          </span>
        </div>

        <div className="flex mt-auto max-sm:gap-4 justify-center relative z-20">
          {!course?.isSaved && (
            <button
              type="button"
              className="absolute max-sm:static end-0 cursor-pointer"
              onClick={() => {}}
            >
              <SaveIcon />
            </button>
          )}
          <DefaultButton
            text={
              course?.isEnrolled ? t("Continue_Learning") : t("course_details")
            }
            onClick={() => {
              let path = "";
              if (token) {
                path = `/user-course-details/${course.id}`;
              } else {
                path = `/guest-course-details/${course.id}`;
              }
              navigate(path);
            }}
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
