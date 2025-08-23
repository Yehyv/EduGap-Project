import type { CourseTypes } from "@/shared/types/courses";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
import GhostButton from "../ui/GhostButton";
const CoursesSectionCard = ({ Sections }: { course: CourseTypes }) => {
  return (
    <div
      className="bg-white flex rounded-2xl shadow-custom overflow-hidden my-2 mx-1"
      dir="auto"
    >
      <div className="w-1/2">
        <img className="w-full h-full object-cover" src={CourseSection}></img>
      </div>
      <div className="w-full p-4">
        <h3 className="mb-4">مبرمج بايثون محترف</h3>
        <p className="line-clamp-5 mb-5" title="">
          إذا كنت ترغب في الدخول إلى سوق العمل التقني أو تطوير مسارك المهني به،
          فيجب عليك التركيز على إصقال مهاراتك في البرمجة ولأن لغة بايثون تُعد من
          أكثر لغات البرمجة انتشارًا وسهولة، فإن تعلمها يفتح لك أبوابًا واسعة في
          مجالات متعددة مثل تطوير البرمجيات، تحليل البيانات، الذكاء الاصطناعي،
          وتعلم الآلة. برنامج ""مبرمج بايثون محترف"" صُمم خصيصا...
        </p>

        <div className="text-end">
          <GhostButton to="" buttonText="عرض برنامج التعلم" />
        </div>
      </div>
    </div>
  );
};

export default CoursesSectionCard;
