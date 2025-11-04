import type { TestimonialsTypes } from "@/shared/types/sharedTypes";
import personImage from "@/assets/imgs/ForDev/Person.jpg";
import InstituteIcon from "@/assets/imgs/ForDev/HIMSLogo.png";
const TestimonialsCard = ({
  Testimonials,
}: {
  Testimonials: TestimonialsTypes;
}) => {
  return (
    <div className="flex flex-col mx-10 my-5" dir="auto">
      <div className="flex max-sm:flex-col max-sm:text-center items-center gap-2">
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <img src={personImage} className="w-full h-full object-cover"></img>
        </div>
        <div>
          <h4>{Testimonials.name}</h4>
          <span>جرافيك ديزاين</span>
        </div>
      </div>
      <div>
        <p className="line-clamp-4 mt-2">
          &rdquo; انا اتعلمت التغذيه البصريه في كورس ال graphic design واصمم اي
          حاجه اشوفها والاضاءه واتعامل معاهم ازاي واعمل كارت شخصي واعلانات و
          ازاي اتعامل علي اي حاجه في برنامج photo shop &rdquo;
        </p>
      </div>
      <div className="flex items-center justify-center mt-4 custom-text-gradient">
        <img src={InstituteIcon} className="w-12"></img>
        <p className="text-center py-3 px-5">
          المعهد العالي للعلوم الإدارية - القطامية
        </p>
      </div>
    </div>
  );
};

export default TestimonialsCard;
