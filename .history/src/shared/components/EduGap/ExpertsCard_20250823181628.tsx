import type { ExpertsData } from "@/shared/types/courses";
import personImage from "@/assets/imgs/ForDev/Person.jpg";

const ExpertsCard = ({ experts }: { course: ExpertsData }) => {
  return (
    <div className=" mx-10 mt-5" dir="auto">
      <div className="flex items-center gap-2">
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <img src={personImage} className="w-full h-full object-cover"></img>
        </div>
        <div>
          <h4>إبراهيم محمد</h4>
          <span>جرافيك ديزاين</span>
        </div>
      </div>
    </div>
  );
};

export default ExpertsCard;
