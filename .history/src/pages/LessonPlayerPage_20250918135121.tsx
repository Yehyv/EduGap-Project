import { useEffect, useState } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import StickyCourseSummaryCard from "@/features/CourseDetails/components/CourseInfoList";
import { useLanguage } from "@/shared/localization/useLanguage";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CourseContentCard from "@/features/CourseDetails/components/CourseContentCard";

const LessonPlayerPage = ({
  buttonText,
  buttonLink,
}: {
  buttonText: string;
  buttonLink: string;
}) => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

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
        <CourseVideo videoUrl={videoUrl} isOnline={isOnline} />
      </div>

      {/* Sidebar */}
      <CourseContentCard />
    </div>
  );
};

export default LessonPlayerPage;
