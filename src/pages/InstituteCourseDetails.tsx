import IconsGroup from "@/assets/svgs/iconsGroup.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import SectionTitle from "@/shared/components/SectionTitle";
import ExpandableText from "@/shared/components/ui/ExpandableText";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import { Loader } from "@/shared/components";
import { useQuery } from "@tanstack/react-query";
import { getInstituteCourseDetails } from "@/features/CourseDetails/services/contentDetails";
import { useParams } from "react-router-dom";
import { useUser } from "@/features/auth/context/UserContext";
import { formatDuration } from "@/shared/utils/globals";
import ErrorMessage from "@/shared/components/ErrorMessage";
import CoursesInInstitute from "@/shared/components/EduGap/CoursesInInstitute";

const InstituteCourseDetails = () => {
  const { t, lang } = useLanguage();
  const { user } = useUser();
  const { instituteCourseId } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getInstituteCourses", instituteCourseId],
    queryFn: () => getInstituteCourseDetails(instituteCourseId ?? ""),
  });

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <ErrorMessage
        message={
          error.message ?? "Error while fetching institute course details"
        }
      />
    );

  return (
    <div>
      <div className="relative bg-gradient-to-b from-primary to-[white] py-14">
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />
        <div className="container flex justify-between max-md:flex-col-reverse max-md:gap-10 max-md:items-center">
          <div className="w-1/3 max-md:w-full">
            <h5 className="font-bold mt-2">
              {`${t("institute_courses_title")} ${user?.instituteName}`}{" "}
            </h5>
            <h4 className="text-2xl mt-2">{data?.name}</h4>
            <div className="flex justify-between mt-4">
              <div className="flex gap-2">
                <VideoIcon />
                <div>{data?.contentsCount} كورسات</div>
              </div>
              <div className="flex gap-2">
                <TimeIcon />
                <div>{formatDuration(data?.totalDuration ?? 0, lang)}</div>
              </div>
            </div>
          </div>
          <div className="relative w-[200px] h-[200px] max-md:w-[150px] max-md:h-[150px] me-[50px]">
            <div className="absolute w-[210px] h-[210px]  max-md:w-[160px] max-md:h-[160px] start-1 bottom-0 bg-[#FCB737] rounded-full" />
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <img
                src={data?.image}
                alt="program"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container pe-30">
        <div>
          <SectionTitle textTitle="عن المقرر" />
          <ExpandableText limit={2} text={data?.description ?? ""} />
        </div>
        <div className="mt-10">
          <SectionTitle textTitle={t("notes")} />
          <ExpandableText limit={2} text={data?.notes ?? ""} />
        </div>
        {/* <section className="py-10">
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
        </section> */}
        <section className="py-10">
          <div className="flex gap-2">
            <VideoIcon />
            <h2>{t("courses")}</h2>
          </div>
          <CoursesInInstitute />
        </section>
      </div>
    </div>
  );
};

export default InstituteCourseDetails;
