import GhostButton from "../ui/GhostButton";
import type { CourseTypes } from "@/shared/types/sharedTypes";
import CourseSection from "@/assets/imgs/ForDev/CourseSection.png";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
const CoursesSectionCard = ({ Sections }: { course: CourseTypes }) => {
  return (
    <div
      className="bg-white flex rounded-2xl shadow-custom overflow-hidden my-5 mx-1"
      dir="auto"
    >
      <div className="w-1/2 relative">
        <img className="w-full h-full object-cover" src={CourseSection}></img>
        <div className="absolute start-2 bottom-2 bg-white rounded-lg px-1 py-0.5 text-sm">
          <VideoIcon className="inline-block" />
          <span>5 كورسات</span>
        </div>
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
