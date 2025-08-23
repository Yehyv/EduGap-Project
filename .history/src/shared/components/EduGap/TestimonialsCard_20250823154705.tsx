import type { TestimonialsTypes } from "@/shared/types/courses";
import personImage from "@/assets/imgs/ForDev/Person.jpg";
const TestimonialsCard = ({ Testimonials }: { course: TestimonialsTypes }) => {
  return (
    <div className="flex flex-col" dir="auto">
      <div>
        <div className="w-10 h-10 rounded-full">
          <img src={personImage} className="w-full object-cover"></img>
        </div>
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
