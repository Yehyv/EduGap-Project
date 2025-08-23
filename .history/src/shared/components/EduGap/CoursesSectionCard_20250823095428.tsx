import type { CourseTypes } from "@/shared/types/courses";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
const CoursesSectionCard = ({ Sections }: { course: CourseTypes }) => {
  return (
    <div className="bg-white flex rounded-2xl" dir="auto">
      <div className="w-1/3">
        <img src={CourseSection}></img>
      </div>
      <div className="w-full"></div>
    </div>
  );
};

export default CoursesSectionCard;
