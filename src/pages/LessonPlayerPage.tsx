import { useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import CourseContentCard from "@/features/CourseDetails/components/CourseContentCard";
import { getContentLesson } from "@/features/CourseDetails/services/contentDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import LessonHeader from "@/features/ContentLesson/components/LessonHeader";
import LessonTabs from "@/features/ContentLesson/components/LessonTabs";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import LessonActions from "@/features/ContentLesson/components/LessonActions";
const LessonComments = lazy(
  () => import("@/features/ContentLesson/components/LessonComments")
);
const LessonAttachments = lazy(
  () => import("@/features/ContentLesson/components/LessonAttachments")
);
const LessonNotes = lazy(
  () => import("@/features/ContentLesson/components/LessonNotes")
);

const LessonPlayerPage = () => {
  const { lang } = useLanguage();
  const { lessonId } = useParams();
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "comments" | "attachments" | "notes"
  >("comments");

  const { data } = useQuery({
    queryKey: ["getContentLesson", lessonId],
    queryFn: () => getContentLesson(lessonId!),
    enabled: !!lessonId,
  });

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <ScrollToTop />

      <LessonHeader
        name={"Back to course details"}
        duration="8 ساعة 50 دقيقة"
        lang={lang}
      />

      <div className="flex h-full justify-start flex-col-reverse gap-6 mx-6 lg:mx-14 lg:flex-row">
        <div className="w-full lg:w-[80%]">
          <CourseVideo videoUrl={data?.video ?? ""} isOnline={isOnline} />

          <LessonActions
            lessonTitle={data?.name ?? ""}
            lessonId={lessonId ?? ""}
          />

          <LessonTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="my-10">
            <Suspense fallback={<CircleLoader />}>
              {activeTab === "comments" && <LessonComments />}
              {activeTab === "attachments" && <LessonAttachments />}
              {activeTab === "notes" && <LessonNotes />}
            </Suspense>
          </div>
        </div>

        <CourseContentCard />
      </div>
    </div>
  );
};

export default LessonPlayerPage;
