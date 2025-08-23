import type { CourseTypes } from "@/shared/types/courses";

const CoursesSectionCard = ({ Sections }: { course: CourseTypes }) => {
  return (
    <div className="bg-white flex rounded-2xl">
      <div className="w-1/3">
        <img src=""></img>
      </div>
      <div className="w-full"></div>
    </div>
  );
};

export default CoursesSectionCard;
