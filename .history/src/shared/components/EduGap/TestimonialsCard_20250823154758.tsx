import type { TestimonialsTypes } from "@/shared/types/courses";
import personImage from "@/assets/imgs/ForDev/Person.jpg";
const TestimonialsCard = ({ Testimonials }: { course: TestimonialsTypes }) => {
  return (
    <div className="flex flex-col" dir="auto">
      <div>
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <img src={personImage} className="w-full object-contain"></img>
        </div>
        <div>
          <h4>إبراهيم محمد</h4>
          <span>جرافيك ديزاين</span>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default TestimonialsCard;
