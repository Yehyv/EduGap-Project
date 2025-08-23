import type { TestimonialsTypes } from "@/shared/types/courses";
import personImage from "@/assets/imgs/ForDev/Person.jpg";
import { Quote } from "lucide-react"; // أيقونة جاهزة

const TestimonialsCard = ({ Testimonials }: { course: TestimonialsTypes }) => {
  return (
    <div className="flex flex-col" dir="auto">
      <div className="flex items-center gap-2">
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <img src={personImage} className="w-full h-full object-cover"></img>
        </div>
        <div>
          <h4>إبراهيم محمد</h4>
          <span>جرافيك ديزاين</span>
        </div>
      </div>
      <div>
        <span className="absolute -top-4 -left-4 text-5xl text-gray-300 leading-none">
          &ldquo;
        </span>{" "}
        <p>
          انا اتعلمت التغذيه البصريه في كورس ال graphic design واصمم اي حاجه
          اشوفها والاضاءه واتعامل معاهم ازاي واعمل كارت شخصي واعلانات و ازاي
          اتعامل علي اي حاجه في برنامج photo shop
        </p>
        “
      </div>
    </div>
  );
};

export default TestimonialsCard;
