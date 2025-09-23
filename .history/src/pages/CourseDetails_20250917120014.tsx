import { useEffect, useState } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import StickyCourseSummaryCard from "@/features/CourseDetails/components/CourseInfoList";
import UserIcon from "@/assets/svgs/UserIcon.svg";
const CourseDetails = () => {
  const [isOnline, setIsOnline] = useState(true);
  const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row m-6 md:m-14 gap-6">
      <div className="w-full md:w-[80%]">
        <CourseVideo videoUrl={videoUrl} isOnline={isOnline} />
        <div>
          <h4 className="my-5">التسويق بالذكاء الاصطناعي</h4>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full shadow-md">
              <img src={UserIcon} className="w-full object-contain"></img>
            </div>
            <div>
              <div className="font-semibold">حسام رفعت</div>
              <div className="font-[#575757] font-light">خبير تسويق</div>
            </div>
          </div>
          <p>
            يُعد استخدام الذكاء الاصطناعي في التسويق بمثابة تغيير جذري في قواعد
            اللعبة، حيث أحدث ثورة في كيفية تواصل الشركات مع جماهيرها.، تم تصميم
            هذه الدورة الديناميكية بدقة لتزويد المسوقين ورواد الأعمال وصانعي
            المحتوى بالمعرفة والمهارات اللازمة لتسخير الإمكانات الكاملة لأدوات
            الذكاء الاصطناعي في تشكيل حملات تسويقية فعالة ومؤثرة. سنتناول في هذه
            الدورة أسس الذكاء الاصطناعي في التسويق وكيف يمكن تطبيقها بشكل فعال
          </p>
        </div>
      </div>
      <StickyCourseSummaryCard />
    </div>
  );
};

export default CourseDetails;
