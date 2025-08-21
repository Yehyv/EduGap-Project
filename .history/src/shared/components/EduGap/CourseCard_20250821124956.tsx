import InstructorImage from "@/assets/imgs/ForDev/InstructorImage.png";
const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-[300px] w-full">
      <div className="relative overflow-hidden">
        <img
          src={InstructorImage}
          alt="Product image"
          className="w-full object-cover"
        />
        <div className="h-4 w-full bg-primary/80 absolute bottom-0"></div>
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

        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star-half-alt" />
          </div>
          <span className="text-gray-600 text-sm ml-2">(4.5/5)</span>
        </div>
        <p className="text-sm font-semibold text-[#939393]">
          د/محمد سعيد - دكتور جامعي
        </p>

        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-full font-semibold hover:bg-blue-600 transition-colors duration-200">
            Add to Cart
          </button>
          <button className="bg-gray-200 text-gray-800 py-2 px-4 rounded-full font-semibold hover:bg-gray-300 transition-colors duration-200">
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
