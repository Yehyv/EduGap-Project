import IconsGroup from "@/assets/svgs/iconsGroup.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import programImage from "@/assets/imgs/ForDev/programImage.jpg";
import SectionTitle from "@/shared/components/SectionTitle";
import ExpandableText from "@/shared/components/ui/ExpandableText";
const ProgramDetails = () => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="relative bg-gradient-to-b from-primary to-[white] py-10 pb-16">
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />
        <div className="container flex justify-between max-md:flex-col-reverse max-md:gap-10 max-md:items-center">
          <div className="w-1/2 max-md:w-full">
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
          <div className="relative w-[200px] h-[200px] max-md:w-[150px] max-md:h-[150px]">
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
      <div className="container">
        <SectionTitle textTitle="عن برنامج التعلم" />
        <ExpandableText text="إذا كنت ترغب في الدخول إلى سوق العمل التقني أو تطوير مسارك المهني به، فيجب عليك التركيز على إصقال مهاراتك في البرمجة ولأن لغة بايثون تُعد من أكثر لغات البرمجة انتشارًا وسهولة، فإن تعلمها يفتح لك أبوابًا واسعة في مجالات متعددة مثل تطوير البرمجيات، تحليل البيانات، الذكاء الاصطناعي، وتعلم الآلة. برنا مبرمج بايثون محترف صُمم خصيصًا لمساعدتك على تعلم بايثون خطوة بخطوة، حتى وإن لم تكن لديك أي خلفية برمجية. من خلال ثلاث دورات تدريبية متكاملة، ستنتقل من المفاهيم الأساسية إلى المهارات المتقدمة، وتتعلّم كيف تكتب شيفرة برمجية نظيفة وفعالة، وكيف تستخدم بايثون لحل مشكلات حقيقية في مجالات متنوعة. كما يركز البرنامج على الجانب العملي من خلال أمثلة وتطبيقات واقعية، مما يساعدك على بناء الثقة في مهاراتك البرمجية المزيد" />
      </div>
    </div>
  );
};

export default ProgramDetails;
