import { useState, useEffect, lazy, Suspense } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CourseContentCard from "@/features/CourseDetails/components/CourseContentCard";
import { useLanguage } from "@/shared/localization/useLanguage";
import CommentsSection from "@/shared/components/ui/CommentsSections";
import AddNotesInLesson from "@/features/CourseDetails/components/AddNotesInLesson";

// Lazy load SVGs
const RightArrow = lazy(() => import("@/assets/svgs/RightArrow.svg?react"));
const TimeIcon = lazy(() => import("@/assets/svgs/TimeIcon.svg?react"));
const FavStarIcon = lazy(() => import("@/assets/svgs/FavStarIcon.svg?react"));
const LikeIcon = lazy(() => import("@/assets/svgs/LikeIcon.svg?react"));
const DisLikeIcon = lazy(() => import("@/assets/svgs/DislikeIcon.svg?react"));
const TitleLine = lazy(() => import("@/assets/svgs/TitileLine.svg?react"));

const LessonPlayerPage = () => {
  const { lang } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);

  // ✅ State for tabs
  const [activeTab, setActiveTab] = useState<
    "comments" | "attachments" | "notes" | "questions"
  >("comments");

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
    <div className="h-full">
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
            <Suspense fallback={null}>
              <RightArrow className={`${lang === "ar" ? "rotate-180" : ""}`} />
            </Suspense>
          </div>
          <div className="flex gap-2 mt-2 text-sm">
            <Suspense fallback={null}>
              <TimeIcon className="w-4" />
            </Suspense>
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
                <Suspense fallback={null}>
                  <FavStarIcon className="w-5 h-5" />
                </Suspense>
                <div>إضافة الي الدروس الهامة</div>
              </button>
              <div className="bg-[#F5F5F5] rounded-3xl flex items-center gap-3 p-2">
                <div className="center gap-2 border-e border-secondary px-3 cursor-pointer">
                  <Suspense fallback={null}>
                    <DisLikeIcon className="w-5 h-5" />
                  </Suspense>
                </div>
                <div className="center gap-2 cursor-pointer">
                  <div>21</div>
                  <Suspense fallback={null}>
                    <LikeIcon className="w-5 h-5" />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 gap-2 bg-[#F5F5F5] p-2 rounded-3xl">
            <div
              onClick={() => setActiveTab("comments")}
              className={`w-1/4 rounded-3xl py-1 cursor-pointer text-center transition ${
                activeTab === "comments"
                  ? "bg-white shadow-md"
                  : "bg-transparent"
              }`}
            >
              التعليقات
            </div>
            <div
              onClick={() => setActiveTab("attachments")}
              className={`w-1/4 rounded-3xl py-1 cursor-pointer text-center transition ${
                activeTab === "attachments"
                  ? "bg-white shadow-md"
                  : "bg-transparent"
              }`}
            >
              المرفقات
            </div>
            <div
              onClick={() => setActiveTab("notes")}
              className={`w-1/4 rounded-3xl py-1 cursor-pointer text-center transition ${
                activeTab === "notes" ? "bg-white shadow-md" : "bg-transparent"
              }`}
            >
              الملاحظات
            </div>
            <div
              onClick={() => setActiveTab("questions")}
              className={`w-1/4 rounded-3xl py-1 cursor-pointer text-center transition ${
                activeTab === "questions"
                  ? "bg-white shadow-md"
                  : "bg-transparent"
              }`}
            >
              الاسئلة
            </div>
          </div>

          {/* Conditional Content */}
          <div className="my-10">
            {activeTab === "comments" && (
              <>
                <div className="mb-5">
                  <h4 className="mb-0"> التعليقات</h4>
                  <Suspense fallback={null}>
                    <TitleLine className={"w-22"} />
                  </Suspense>
                </div>
                <CommentsSection />
              </>
            )}
            {activeTab === "attachments" && (
              <div className="p-4 bg-white rounded-2xl shadow min-h-[400px]">
                📎 المرفقات هنا
              </div>
            )}

            {activeTab === "notes" && (
              <div className="min-h-[400px]">
                <AddNotesInLesson />
                <div className="flex">
                  <div className="bg-[#F3FEFF] min-h[200px] w-1/2"></div>
                  <div className="bg-[#F3FEFF] min-h[200px] w-1/2"></div>
                </div>
              </div>
            )}
            {activeTab === "questions" && (
              <div className="p-4 bg-white rounded-2xl shadow min-h-[400px]">
                ❓ الاسئلة هنا
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <CourseContentCard />
      </div>
    </div>
  );
};

export default LessonPlayerPage;
