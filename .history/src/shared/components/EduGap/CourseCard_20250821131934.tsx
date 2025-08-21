import InstructorImage from "@/assets/imgs/ForDev/InstructorImage.png";
import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import VolumeIcon from "@/assets/svgs/VolumeIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import DefaultButton from "../ui/DefaultButton";

type Course = {
  category: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  level: string;
  image?: string; // optional, fallback to InstructorImage
};

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-[250px] w-full">
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={course?.image || InstructorImage}
          alt={course?.title}
          className="w-full object-cover"
        />
        <MedalIcon className="absolute top-2 end-2" />
        <div className="absolute center bottom-0 w-full h-5 bg-primary/80 flex items-center gap-2 px-2">
          <VolumeIcon />
          <span className="text-secondary text-sm">{course?.level}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 pt-2">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <p className="text-sm font-semibold text-gray-400">
              {course?.category}
            </p>
            <div className="flex items-center justify-between">
              <h5
                className="font-semibold text-gray-800 line-clamp-1"
                title={course?.title}
              >
                {course?.title}
              </h5>
              <SaveIcon />
            </div>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-400">
          {course?.instructor}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="me-1">{course?.rating?.toFixed(1)}</span>
            {[...Array(4)].map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="text-gray-400 text-sm ms-2">
            ({course?.reviews?.toLocaleString()})
          </span>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <DefaultButton
            text="ابدأ التعلم"
            onClick={() => {}}
            type="button"
            moreStyle="min-w-[150px] rounded-3xl py-1"
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
