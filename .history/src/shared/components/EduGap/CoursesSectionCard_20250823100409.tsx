import type { CourseTypes } from "@/shared/types/courses";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
const CoursesSectionCard = ({ Sections }: { course: CourseTypes }) => {
  return (
    <div className="bg-white flex rounded-2xl me-10" dir="auto">
      <div className="w-1/2">
        <img className="w-full object-cover" src={CourseSection}></img>
      </div>
      <div className="w-full px-3 py-4">
        <h3 className="mb-4">مبرمج بايثون محترف</h3>
        <p className="line-clamp-5" title="">
          إذا كنت ترغب في الدخول إلى سوق العمل التقني أو تطوير مسارك المهني به،
          فيجب عليك التركيز على إصقال مهاراتك في البرمجة ولأن لغة بايثون تُعد من
          أكثر لغات البرمجة انتشارًا وسهولة، فإن تعلمها يفتح لك أبوابًا واسعة في
          مجالات متعددة مثل تطوير البرمجيات، تحليل البيانات، الذكاء الاصطناعي،
          وتعلم الآلة. برنامج ""مبرمج بايثون محترف"" صُمم خصيصا...
        </p>
      </div>
    </div>
  );
};

export default CoursesSectionCard;
