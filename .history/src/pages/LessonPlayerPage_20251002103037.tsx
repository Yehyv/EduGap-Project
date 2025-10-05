import { useEffect, useState } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CourseContentCard from "@/features/CourseDetails/components/CourseContentCard";
import RightArrow from "@/assets/svgs/RightArrow.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import FavStarIcon from "@/assets/svgs/FavStarIcon.svg?react";
import LikeIcon from "@/assets/svgs/LikeIcon.svg?react";
import DisLikeIcon from "@/assets/svgs/DislikeIcon.svg?react";
import TitleLine from "@/assets/svgs/TitileLine.svg?react";
import CommentsSection from "@/shared/components/ui/CommentsSections";
const LessonPlayerPage = () => {
  const { lang } = useLanguage();
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
      <div className="flex max-md:flex-col max-md:gap-4 justify-between items-start pt-2 lg:mx-14 container">
        {/* Progress Section */}
        <div className="flex items-center gap-2">
          <div className="text-secondary">(104/72) 41%</div>
          <div className="w-[250px] max-md:w-[150px] h-1 bg-gray-300 rounded">
            <div
              className="h-1 bg-secondary rounded"
              style={{ width: "41%" }}
            ></div>
          </div>
        </div>

        {/* Title + Arrow */}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="m-0">تعلم اللغة الإنجليزية من الصفر للاحترافية</h4>
            <RightArrow className={`${lang === "ar" ? "rotate-180" : ""}`} />
          </div>
          <div className="flex gap-2 mt-2 text-sm">
            <TimeIcon className="w-4" />
            <div>8 ساعة 50 دقيقة</div>
          </div>
        </div>
      </div>

      <div className="flex justify-start flex-col-reverse gap-6 m-6 lg:mx-14 lg:flex-row">
        {/* Main content */}
        <div className="w-full lg:w-[80%]">
          <CourseVideo videoUrl={videoUrl} isOnline={isOnline} />
          <div className="flex max-md:flex-col max-md:gap-3 justify-between py-2">
            <h4>1.2 أهمية الذكاء الاصطناعي</h4>
            <div className="flex max-md:justify-center gap-2 text-secondary">
              <button className="bg-[#F5F5F5] rounded-3xl text-sm px-6 py-2 center gap-2 cursor-pointer">
                <FavStarIcon className="w-5 h-5" />
                <div>إضافة الي الدروس الهامة</div>
              </button>
              <div className="bg-[#F5F5F5] rounded-3xl flex items-center gap-3 p-2">
                <div className="center gap-2 border-e border-secondary px-3 cursor-pointer">
                  <DisLikeIcon className="w-5 h-5" />
                </div>
                <div className="center gap-2 cursor-pointer">
                  <div>21</div>
                  <LikeIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex mt-4 gap-2 bg-[#F5F5F5] p-2 rounded-3xl">
            <div className="w-1/2 rounded-3xl py-1 cursor-pointe bg-white text-center">
              التعليقات
            </div>
            <div className="w-1/2 rounded-s-xl cursor-pointer py-1 text-center">
              المرفقات
            </div>
            <div className="w-1/2 rounded-3xl py-1 cursor-pointer text-center">
              الملاحظات
            </div>
            <div className="w-1/2 rounded-3xl py-1 cursor-pointer text-center">
              الاسئلة
            </div>
          </div>
          <div className="my-10">
            <div className="mb-5">
              <h4 className="mb-0"> التعليقات</h4>
              <TitleLine className={"w-22"} />
            </div>
            <CommentsSection />
          </div>
        </div>

        {/* Sidebar */}
        <CourseContentCard />
        <div className="w-full xl:sticky shadow-custom overflow-auto top-16 lg:w-[30%] rounded-xl py-5 min-lg:min-h-full min-lg:h-[400px]"></div>
      </div>
    </div>
  );
};

export default LessonPlayerPage;
