import { useEffect, useState } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import StickyCourseSummaryCard from "@/features/CourseDetails/components/CourseInfoList";
import UserIcon from "@/assets/svgs/UserIcon.svg";
import SectionTitle from "@/shared/components/SectionTitle";
import { useLanguage } from "@/shared/localization/useLanguage";
import CheckIcon from "@/assets/svgs/CheckIcon.svg?react";
import FAQList from "@/shared/components/ui/FAQList";

const faqs = [
  {
    question: "فهم ما هو الذكاء الاصناعي",
    answer: ["تعريف الذكاء الاصناعي", "أهمية الذكاء الاصناعي"],
  },
  {
    question: "استخدام الذكاء الاصطناعي في الاعمال",
    answer: ["فهم ما هو الذكاء الاصناعي", "أهمية الذكاء الاصناعي"],
  },
  {
    question: "استخدام الذكاء الاصطناعي في انتاج مقاطع الفيديو التسويقية",
    answer: ["فهم ما هو الذكاء الاصناعي", "أهمية الذكاء الاصناعي"],
  },
];

const whatToLearn = [
  "تتعرف على أسس الذكاء الاصطناعي في التسويق، وتتعلم كيفية استخدام البيانات والتحليلات الذكية في تحسين استراتيجيات التسويق.",
  "تستخدم ChatGPT في الحملات التسويقية لزيادة التفاعل والتأثير، وتنشئ محتوى تسويقي مبتكر باستخدام تقنيات الذكاء الاصطناعي.",
  "تستخدم ChatGPT لإنشاء صور احترافية وجذابة لاستخدامها في الحملات التسويقية. كما ستتعلم أن تنشئ الصور باستخدام الأدوات مثل: Bing، وAdobe Firefly، وMicrosoft Designer.",
  "تستخدم تطبيق Capcut لتحرير وتحسين الفيديوهات التسويقية، مما يسهم في تقليل الميزانية المخصصة للتسويق والحصول على فيديوهات احترافية تعزز تفاعل الجمهور المستهدف.",
];

const CourseDetails = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

  // ✅ online/offline status handler
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    updateStatus(); // initial run

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 m-6 md:m-14 md:flex-row">
      {/* Main content */}
      <div className="w-full md:w-[80%]">
        <CourseVideo videoUrl={videoUrl} isOnline={isOnline} />

        {/* Instructor Info */}
        <section className="my-5">
          <h4 className="my-5">التسويق بالذكاء الاصطناعي</h4>

          <div className="flex items-center gap-2 my-4">
            <div className="w-12 h-12 rounded-full shadow-md overflow-hidden">
              <img
                src={UserIcon}
                alt="Instructor"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-semibold">حسام رفعت</p>
              <p className="text-[#575757] font-light">خبير تسويق</p>
            </div>
          </div>

          <p className="leading-relaxed text-gray-700">
            يُعد استخدام الذكاء الاصطناعي في التسويق بمثابة تغيير جذري في قواعد
            اللعبة، حيث أحدث ثورة في كيفية تواصل الشركات مع جماهيرها. تم تصميم
            هذه الدورة الديناميكية بدقة لتزويد المسوقين ورواد الأعمال وصانعي
            المحتوى بالمعرفة والمهارات اللازمة لتسخير الإمكانات الكاملة لأدوات
            الذكاء الاصطناعي في تشكيل حملات تسويقية فعالة ومؤثرة. سنتناول في هذه
            الدورة أسس الذكاء الاصطناعي في التسويق وكيف يمكن تطبيقها بشكل فعال.
          </p>
        </section>

        {/* What to learn */}
        <section className="py-5 border-b border-[#575757]">
          <SectionTitle textTitle={t("what_to_learn")} />
          <ul className="space-y-4 mt-4">
            {whatToLearn.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Course content (FAQ) */}
        <section className="py-5 my-6">
          <SectionTitle textTitle={t("course_content")} />
          <FAQList faqs={faqs} />
        </section>
      </div>

      {/* Sidebar */}
      <StickyCourseSummaryCard />
    </div>
  );
};

export default CourseDetails;
