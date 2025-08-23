import GhostButton from "../ui/GhostButton";
import type { TestimonialsTypes } from "@/shared/types/courses";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
const TestimonialsCard = ({ Testimonials }: { course: TestimonialsTypes }) => {
  return (
    <div className="flex flex-col" dir="auto">
      <div>
        <img></img>
        <div>
          <h4></h4>
          <span></span>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default TestimonialsCard;
