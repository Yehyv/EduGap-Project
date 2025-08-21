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
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              تعلم اللغة الإنجليزية من الصفر للاحترافية{" "}
            </h2>
            <p className="text-sm text-gray-600">Electronics</p>
          </div>
        </div>
        <div className="py-2">
          <p className="text-lg font-bold text-green-600">$129.99</p>
          <p className="text-sm text-gray-500 line-through">$159.99</p>
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
        <p className="text-gray-600 text-sm mb-4">
          Experience crystal-clear sound with our premium wireless headphones.
          Perfect for music lovers and professionals alike.
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <i className="fas fa-truck text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Free Shipping</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-clock text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">In Stock</span>
          </div>
        </div>
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
