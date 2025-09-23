import { useEffect, useState } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import StickyCourseSummaryCard from "@/features/CourseDetails/components/CourseInfoList";
import UserIcon from "@/assets/svgs/UserIcon.svg";
import SectionTitle from "@/shared/components/SectionTitle";
import { useLanguage } from "@/shared/localization/useLanguage";
import CheckIcon from "@/assets/svgs/CheckIcon.svg?react";
const CourseDetails = () => {
  const { t } = useLanguage();
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
        <div className="my-5">
          <h4 className="my-5">التسويق بالذكاء الاصطناعي</h4>
          <div className="flex items-center gap-2 my-4">
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
        <div>
          <SectionTitle textTitle={t("what_to_learn")} />
          <ul>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-6 h-6" />
              <span>
                تتعرف على أسس الذكاء الاصطناعي في التسويق، وتتعلم كيفية استخدام
                البيانات والتحليلات الذكية في تحسين استراتيجيات التسويق.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>
                تتعرف على أسس الذكاء الاصطناعي في التسويق، وتتعلم كيفية استخدام
                البيانات والتحليلات الذكية في تحسين استراتيجيات التسويق.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>
                تتعرف على أسس الذكاء الاصطناعي في التسويق، وتتعلم كيفية استخدام
                البيانات والتحليلات الذكية في تحسين استراتيجيات التسويق.
              </span>
            </li>
          </ul>
        </div>
      </div>
      <StickyCourseSummaryCard />
    </div>
  );
};

export default CourseDetails;
