import InstructorAvatar from "@/assets/svgs/InstructorAvatar.svg";
import type { ContinueCourseType } from "@/shared/types/sharedTypes";
import { Link } from "react-router-dom";

type ContinueWhereLeftOffCardProps = {
  course: ContinueCourseType;
};

const ContinueWhereLeftOffCard: React.FC<ContinueWhereLeftOffCardProps> = ({
  course,
}) => {
  const educator = course?.educators?.[0];
  const courseName = course?.content?.name ?? "دورة بدون عنوان";
  const lessonName = course?.lessonName ?? "—";

  return (
    <Link
      to={`/lesson-details/${course?.content?.id}/${course?.lessonId}`}
      className="group relative w-full bg-white rounded-xl shadow-custom block 
                 overflow-hidden transition-all duration-300 ease-in-out
                 hover:-translate-y-2 my-3 p-3  cursor-pointer"
    >
      {/* Content Section */}
      <div className="flex-1 mb-3">
        <h5
          className="font-semibold text-gray-800 line-clamp-1"
          title={courseName}
        >
          {courseName}
        </h5>

        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-400 line-clamp-1">
            {educator
              ? `${educator.title ?? ""} ${educator.firstName ?? ""} ${
                  educator.lastName ?? ""
                }`
              : "—"}
          </span>
          <span className="text-sm font-semibold text-yellow-400">
            {course?.content?.rate ?? 0}
          </span>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative overflow-hidden rounded-xl mb-3">
        <img
          src={course?.imageUrl || InstructorAvatar}
          alt={lessonName}
          className="w-full h-[180px] object-contain rounded-3xl"
          onError={(e) => {
            e.currentTarget.src = InstructorAvatar;
          }}
        />
      </div>

      {/* Lesson Progress */}
      <div className="flex justify-between text-sm text-secondary">
        <span className="line-clamp-1">{lessonName}</span>
        <span className="line-clamp-1">
          {course?.content?.completedLessonsCount ?? 0}/
          {course?.content?.lessonsCount ?? 0}
        </span>
      </div>
    </Link>
  );
};

export default ContinueWhereLeftOffCard;
