import type { TestimonialsTypes } from "@/shared/types/courses";
import personImage from "@/assets/imgs/ForDev/Person.jpg";

const ExpertsCard = ({ expertsData }: { course: TestimonialsTypes }) => {
  return (
    <div className="flex flex-col mx-10 mt-5" dir="auto">
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
        <p className="line-clamp-4">
          &rdquo; انا اتعلمت التغذيه البصريه في كورس ال graphic design واصمم اي
          حاجه اشوفها والاضاءه واتعامل معاهم ازاي واعمل كارت شخصي واعلانات و
          ازاي اتعامل علي اي حاجه في برنامج photo shop &rdquo;
        </p>
      </div>
    </div>
  );
};

export default ExpertsCard;
