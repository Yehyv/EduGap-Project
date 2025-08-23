import type { TestimonialsTypes } from "@/shared/types/courses";
import personImage from "@/assets/imgs/ForDev/Person.jpg";
const TestimonialsCard = ({ Testimonials }: { course: TestimonialsTypes }) => {
  return (
    <div className="flex flex-col" dir="auto">
      <div>
        <img src={personImage}></img>
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
