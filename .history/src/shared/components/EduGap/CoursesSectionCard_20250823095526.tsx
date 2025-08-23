import type { CourseTypes } from "@/shared/types/courses";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
const CoursesSectionCard = ({ Sections }: { course: CourseTypes }) => {
  return (
    <div className="bg-white flex rounded-2xl">
      <div className="w-full"></div>
      <div className="w-1/3">
        <img className="w-full" src={CourseSection}></img>
      </div>
    </div>
  );
};

export default CoursesSectionCard;
