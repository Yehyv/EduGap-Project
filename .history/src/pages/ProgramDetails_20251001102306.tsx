import IconsGroup from "@/assets/svgs/iconsGroup.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import programImage from "@/assets/imgs/ForDev/programImage.jpg";
import SectionTitle from "@/shared/components/SectionTitle";
import ExpandableText from "@/shared/components/ui/ExpandableText";
import CheckIcon from "@/assets/svgs/CheckIcon.svg?react";
import { useEffect, useState } from "react";
import { Loader } from "@/shared/components";

const ProgramDetails = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="relative bg-gradient-to-b from-primary to-[white] py-40">
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />
        <div className="container flex justify-between max-md:flex-col-reverse max-md:gap-10 max-md:items-center">
          <div className="w-1/3 max-md:w-full">
            <h5 className="font-bold mt-2">{t("program_title")}</h5>
            <h4 className="text-2xl mt-2">مبرمج بايثون محترف </h4>
            <div className="flex justify-between mt-4">
              <div className="flex gap-2">
                <VideoIcon />
                <div>3 كورسات</div>
              </div>
              <div className="flex gap-2">
                <TimeIcon />
                <div>12 ساعه و 35 دقيقة</div>
              </div>
            </div>
          </div>
          <div className="relative w-[200px] h-[200px] max-md:w-[150px] max-md:h-[150px] me-[50px]">
            <div className="absolute w-[200px] h-[200px]  max-md:w-[150px] max-md:h-[150px] start-6 bg-[#FCB737] rounded-2xl -rotate-[30deg]" />
            <div className="absolute inset-0 rounded-2xl overflow-hidden -rotate-[30deg]">
              <img
                src={programImage}
                alt="program"
                className="w-full h-full object-cover rotate-[30deg] scale-150"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container pe-30">
        <div>
          <SectionTitle textTitle="عن برنامج التعلم" />
          <ExpandableText
            limit={2}
            text="إذا كنت ترغب في الدخول إلى سوق العمل التقني أو تطوير مسارك المهني به، فيجب عليك التركيز على إصقال مهاراتك في البرمجة ولأن لغة بايثون تُعد من أكثر لغات البرمجة انتشارًا وسهولة، فإن تعلمها يفتح لك أبوابًا واسعة في مجالات متعددة مثل تطوير البرمجيات، تحليل البيانات، الذكاء الاصطناعي، وتعلم الآلة. برنا مبرمج بايثون محترف صُمم خصيصًا لمساعدتك على تعلم بايثون خطوة بخطوة، حتى وإن لم تكن لديك أي خلفية برمجية. من خلال ثلاث دورات تدريبية متكاملة، ستنتقل من المفاهيم الأساسية إلى المهارات المتقدمة، وتتعلّم كيف تكتب شيفرة برمجية نظيفة وفعالة، وكيف تستخدم بايثون لحل مشكلات حقيقية في مجالات متنوعة. كما يركز البرنامج على الجانب العملي من خلال أمثلة وتطبيقات واقعية، مما يساعدك على بناء الثقة في مهاراتك البرمجية المزيد"
          />
        </div>
        <section className="py-10">
          <SectionTitle textTitle={t("what_to_learn")} />
          <ul className="space-y-4 mt-4">
            {[
              "تتعرف على أسس الذكاء الاصطناعي في التسويق، وتتعلم كيفية استخدام البيانات والتحليلات الذكية في تحسين استراتيجيات التسويق.",
              "تستخدم ChatGPT في الحملات التسويقية لزيادة التفاعل والتأثير، وتنشئ محتوى تسويقي مبتكر باستخدام تقنيات الذكاء الاصطناعي.",
              "تستخدم ChatGPT لإنشاء صور احترافية وجذابة لاستخدامها في الحملات التسويقية. كما ستتعلم أن تنشئ الصور باستخدام الأدوات مثل: Bing، وAdobe Firefly، وMicrosoft Designer.",
              "تستخدم تطبيق Capcut لتحرير وتحسين الفيديوهات التسويقية، مما يسهم في تقليل الميزانية المخصصة للتسويق والحصول على فيديوهات احترافية تعزز تفاعل الجمهور المستهدف.",
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckIcon className="w-6 h-6 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ProgramDetails;
