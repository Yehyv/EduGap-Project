import GhostButton from "../ui/GhostButton";
import type { TestimonialsTypes } from "@/shared/types/courses";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
const TestimonialsCard = ({ Testimonials }: { course: TestimonialsTypes }) => {
  return (
    <div
      className="bg-white flex rounded-2xl shadow-custom overflow-hidden my-2 mx-1"
      dir="auto"
    ></div>
  );
};

export default TestimonialsCard;
