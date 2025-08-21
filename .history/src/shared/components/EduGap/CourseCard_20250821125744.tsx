import InstructorImage from "@/assets/imgs/ForDev/InstructorImage.png";
import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import DefaultButton from "../ui/DefaultButton";
const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-[300px] w-full">
      <div className="relative overflow-hidden">
        <img
          src={InstructorImage}
          alt="Product image"
          className="w-full object-cover"
        />
        <div className="h-4 w-full bg-primary/80 absolute bottom-0">
          عالي المستوي
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm font-semibold text-[#939393]">تجارة</p>
            <h5 className=" font-semibold text-gray-800 mb-1">
              تعلم اللغة الإنجليزية من الصفر للاحترافية
            </h5>
          </div>
        </div>

        <p className="text-sm font-semibold text-[#939393]">
          د/محمد سعيد - دكتور جامعي
        </p>

        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400 items-center gap-1">
            <span className="me-1">4.8</span>
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </div>
          <span className="text-[#939393] text-sm ms-2">(2,145)</span>
        </div>
        <div className="space-x-2 center">
          <DefaultButton
            text="ابدأ التعلم"
            onClick={() => {}}
            type="button"
            moreStyle="min-w-[150px] !rounded-3xl !py-1"
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
