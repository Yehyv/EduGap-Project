import type { ExpertsData } from "@/shared/types/sharedTypes";
import personImage from "@/assets/imgs/ForDev/Person.jpg";

const ExpertsCard = ({ expertData }: { expertData: ExpertsData }) => {
  return (
    <div className="mx-10 my-5" dir="auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-40 h-40 rounded-full overflow-hidden">
          <img src={personImage} className="w-full h-full object-cover"></img>
        </div>
        <div>
          <h4 className="mb-2">{expertData.title}</h4>
          <span>{expertData.bio}</span>
        </div>
      </div>
    </div>
  );
};

export default ExpertsCard;
