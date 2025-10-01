import { useEffect, useState } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CourseContentCard from "@/features/CourseDetails/components/CourseContentCard";

const LessonPlayerPage = () => {
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
      <div>
        <div>تعلم اللغة الإنجليزية من الصفر للاحترافية</div>
        <div className="w-[200px] h-1 bg-secondary"></div>
      </div>
      {/* Main content */}
      <div className="w-full lg:w-[80%]">
        <CourseVideo videoUrl={videoUrl} isOnline={isOnline} />
        <div className="flex mt-4">
          <div className="w-1/2 rounded-s-xl shadow-custom cursor-pointer border-e border-[#939393] py-3 bg-[#F8F8F8] text-secondary text-center">
            المحاضرة التالية 1.24
          </div>
          <div className="w-1/2 rounded-e-xl shadow-custom py-3 cursor-pointer bg-[#F8F8F8] text-secondary text-center">
            المحاضرة السابقة 1.22
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <CourseContentCard />
    </div>
  );
};

export default LessonPlayerPage;
