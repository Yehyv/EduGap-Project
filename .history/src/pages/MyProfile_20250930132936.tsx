import profileImage from "@/assets/imgs/ForDev/Person.jpg";
import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import EyeIcon from "@/assets/svgs/EyeIcon.svg?react";
import PlayVideoIcon from "@/assets/svgs/PlayVideoIcon.svg?react";
import StudentsIcon from "@/assets/svgs/StudentsIcon.svg?react";
import { Loader } from "@/shared/components";
import { useEffect, useState } from "react";
import ExpandableText from "@/shared/components/ui/ExpandableText";

const MyProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="container my-10">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Profile Image & Rating */}
        <div className="w-full md:w-[20%] flex flex-col items-center md:items-start">
          <img
            src={profileImage}
            className="w-50 h-50 object-cover rounded-lg shadow-md"
            alt="Profile"
          />
          <div className="flex items-center gap-1 mt-4">
            <span className="text-yellow-500 font-semibold">4.8</span>
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
            ))}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 flex flex-col">
          <h4 className="w-fit border-t-2 border-[#FCB737] pt-3 text-xl font-bold">
            محمد عبد السلام
          </h4>
          <p className="text-[#575757] text-sm mb-4">
            باحث وخبير في التسويق بإستخدام الذكاء الاصطناعي
          </p>

          <ExpandableText
            limit={2}
            text=" يقوم بدور مهم في الشرق الأوسط، من خلال رصد وتحليل الاتجاهات المختلفة
              في مجالات الأعمال التجارية والمشروعات الناشئة والسفر والإعلام. وقد
              شارك فادي في دورات تدريبية ومؤتمرات دولية في مصر، وتونس، والمملكة
              العربية السعودية، والكويت، وكينيا، وإيطاليا، وغيرها من الدول..."
          />

          {/* Stats */}
          <div className="bg-[#F1EFEF] flex flex-col sm:flex-row justify-between text-base mt-6 px-4 py-1 rounded-lg shadow-sm gap-4">
            <div className="flex items-center gap-2">
              <EyeIcon className="w-6 h-6" />
              <span>المشاهدات : 1,762</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayVideoIcon className="w-6 h-6" />
              <span>الدورات : 2</span>
            </div>
            <div className="flex items-center gap-2">
              <StudentsIcon className="w-6 h-6" />
              <span>المتعلمين : 985</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
