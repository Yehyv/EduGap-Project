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
    setIsLoading(false);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="container my-10">
      <div className="flex gap-6">
        <div className="w-1/4 h-full">
          <img
            src={profileImage}
            className="w-42 h-42 object-cover rounded-lg"
          ></img>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-yellow-400">4.8</span>
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </div>
        </div>
        <div className="flex flex-col">
          <h4 className="w-fit border-t-2 border-[#FCB737] pt-4">
            محمد عبد السلام{" "}
          </h4>
          <p className="text-[#575757] text-sm">
            باحث وخبير في التسويق بإستخدام الذكاء الاصطناعي
          </p>
          <p className="my-4">
            <ExpandableText
              limit={2}
              text=" يقوم بدور مهم في الشرق الأوسط، من خلال رصد وتحليل الاتجاهات المختلفة
            في مجالات الأعمال التجارية والمشروعات الناشئة والسفر والإعلام. وقد
            شارك فادي في دورات تدريبية ومؤتمرات دولية في مصر، وتونس، والمملكة
            العربية السعودية، والكويت، وكينيا، وإيطاليا، وغيرها من الدول  يقوم بدور مهم في الشرق الأوسط، من خلال رصد وتحليل الاتجاهات المختلفة
            في مجالات الأعمال التجارية والمشروعات الناشئة والسفر والإعلام. وقد
            شارك فادي في دورات تدريبية ومؤتمرات دولية في مصر، وتونس، والمملكة
            العربية السعودية، والكويت، وكينيا، وإيطاليا، وغيرها من الدول  يقوم بدور مهم في الشرق الأوسط، من خلال رصد وتحليل الاتجاهات المختلفة
            في مجالات الأعمال التجارية والمشروعات الناشئة والسفر والإعلام. وقد
            شارك فادي في دورات تدريبية ومؤتمرات دولية في مصر، وتونس، والمملكة
            العربية السعودية، والكويت، وكينيا، وإيطاليا، وغيرها من الدول"
            />
          </p>
          <div className="bg-[#F1EFEF] flex justify-between text-lg mt-auto px-4 py-0 rounded-lg">
            <div className="center gap-2">
              <EyeIcon className="w-7" />
              <div>المشاهدات : 1,762</div>
            </div>
            <div className="center gap-2">
              <PlayVideoIcon className="w-6" />
              <div>الدورات : 2</div>
            </div>
            <div className="center gap-2">
              <StudentsIcon className="w-7" />
              <div>المتعلمين : 985</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
