import { useEffect, useState } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CourseContentCard from "@/features/CourseDetails/components/CourseContentCard";
import RightArrow from "@/assets/svgs/RightArrow.svg?react";
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
    <div>
      <ScrollToTop />
      <div className="flex justify-between items-center py-5 lg:mx-14">
        {/* Progress Section */}
        <div className="flex items-center gap-2">
          <div className="text-secondary">(104/72) 41%</div>
          <div className="w-[250px] h-1 bg-gray-300 rounded">
            <div
              className="h-1 bg-secondary rounded"
              style={{ width: "41%" }}
            ></div>
          </div>
        </div>

        {/* Title + Arrow */}
        <div className="flex items-center gap-2">
          <h4 className="m-0">تعلم اللغة الإنجليزية من الصفر للاحترافية</h4>
          <RightArrow />
        </div>
      </div>

      <div className="flex justify-start flex-col-reverse gap-6 m-6 lg:mx-14 lg:flex-row">
        {/* Main content */}
        <div className="w-full lg:w-[80%]">
          <CourseVideo videoUrl={videoUrl} isOnline={isOnline} />
          <div className="flex">
            <h4 className="py-2">1.2 أهمية الذكاء الاصطناعي</h4>
            <button>إضافة الي الدروس الهامة</button>
            <div></div>
          </div>
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
    </div>
  );
};

export default LessonPlayerPage;
