import type { ExpertsData } from "@/shared/types/sharedTypes";
import { Link } from "react-router-dom";

const ExpertsCard = ({ expertData }: { expertData: ExpertsData }) => {
  return (
    <div
      className="mx-10 my-5 transition-transform duration-500 ease-out hover:-translate-y-1"
      dir="auto"
    >
      <Link
        to={`/expert/${expertData.id}`}
        className="flex flex-col items-center gap-2 text-center"
      >
        <div className="w-40 h-40 rounded-full overflow-hidden">
          <img
            src={expertData?.image}
            className="w-full h-full object-cover"
          ></img>
        </div>
        <div>
          <h4 className="mb-2">{expertData.title}</h4>
          <span className="line-clamp-3 text-[#575757]" title={expertData.bio}>
            {expertData.bio}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ExpertsCard;
