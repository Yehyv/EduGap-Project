import { useEffect, useState } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import StickyCourseSummaryCard from "@/features/CourseDetails/components/CourseInfoList";
import UserIcon from "@/assets/svgs/UserIcon.svg";
import SectionTitle from "@/shared/components/SectionTitle";
import { useLanguage } from "@/shared/localization/useLanguage";
import CheckIcon from "@/assets/svgs/CheckIcon.svg?react";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import ExpandableText from "@/shared/components/ui/ExpandableText";
import type { ContentDetailsType } from "@/shared/types/sharedTypes";
import CourseContent from "@/features/UserHome/components/CourseContent";
import ContentRatings from "@/features/UserHome/components/ContentRatings";

const CourseDetails = ({
  buttonText,
  buttonLink,
  data,
}: {
  buttonText: string;
  buttonLink: string;
  data: ContentDetailsType;
}) => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const { firstName, lastName, title } = data.educator;
  const fullName = `${firstName} ${lastName}`;
  const { durationTime, levelName } = data;

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
    <div className="flex flex-col-reverse gap-6 m-6 lg:m-14 lg:flex-row">
      <ScrollToTop />
      {/* Main content */}
      <div className="w-full lg:w-[80%]">
        <CourseVideo videoUrl={data?.adVideo} isOnline={isOnline} />

        {/* Instructor Info */}
        <section className="my-5">
          <h4 className="my-5">{data?.name}</h4>

          <div className="flex items-center gap-2 my-4">
            <div className="w-12 h-12 rounded-full shadow-md overflow-hidden">
              <img
                src={data?.educator.image || UserIcon}
                alt="Instructor"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-semibold">{fullName}</p>
              <p className="text-[#575757] font-light">{title}</p>
            </div>
          </div>

          <ExpandableText limit={3} text={data?.description} />
        </section>

        {/* What to learn */}
        <section className="py-5 border-b border-[#575757]">
          <SectionTitle textTitle={t("what_to_learn")} />
          <ul className="space-y-4 mt-4">
            {data?.whatToLearn.split(",").map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Course content (FAQ) */}
        <CourseContent />

        {/* Ratings */}
        <ContentRatings />
      </div>

      {/* Sidebar */}
      <StickyCourseSummaryCard
        buttonText={buttonText}
        buttonLink={buttonLink}
        durationTime={durationTime}
        levelName={levelName}
      />
    </div>
  );
};

export default CourseDetails;
