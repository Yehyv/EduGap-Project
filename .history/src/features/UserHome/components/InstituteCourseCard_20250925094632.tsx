import InstructorAvatar from "@/assets/svgs/InstructorAvatar.svg";
import type { CourseType } from "@/shared/types/sharedTypes";
import { useLanguage } from "@/shared/localization/useLanguage";

const InstituteCourseCard = ({ course }: { course: CourseType }) => {
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
          src={course.image || InstructorAvatar}
          alt={course?.name}
          className="w-full h-[200px] object-contain"
          onError={(e) => {
            e.currentTarget.src = InstructorAvatar;
          }}
        />
        <div className="absolute -bottom-[20px] w-[90%] h-[40px] bg-[#DEF4FF] left-1/2 -translate-x-1/2 rounded-lg center text-secondary font-bold text-sm p-1 shadow-custom">
          تكنولوجيا الذكاء الاصطناعي
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2 flex-1 text-sm px-6 mt-7">
        <div className="flex justify-between items-start mb-2">
          <div>12 ساعة و 35 دقيقة </div>
          <div>7 كورسات</div>
        </div>
        <div className="text-secondary cursor-pointer">{t("more")}..</div>
      </div>
    </div>
  );
};

export default InstituteCourseCard;
