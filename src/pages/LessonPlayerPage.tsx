import { useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import CourseContentCard from "@/features/CourseDetails/components/CourseContentCard";
import {
  getContentLesson,
  getContentTopicsForUser,
} from "@/features/CourseDetails/services/contentDetails";
import LessonHeader from "@/features/ContentLesson/components/LessonHeader";
import LessonTabs from "@/features/ContentLesson/components/LessonTabs";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import LessonActions from "@/features/ContentLesson/components/LessonActions";
import type { ContentTopicsType } from "@/shared/types/sharedTypes";

const LessonComments = lazy(
  () => import("@/features/ContentLesson/components/LessonComments"),
);
const LessonAttachments = lazy(
  () => import("@/features/ContentLesson/components/LessonAttachments"),
);
const LessonNotes = lazy(
  () => import("@/features/ContentLesson/components/LessonNotes"),
);

const LessonPlayerPage = () => {
  const { lessonId, courseId } = useParams();
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "comments" | "attachments" | "notes"
  >("comments");

  const {
    data: getContentTopicsAndLessons,
    isLoading,
    error,
  } = useQuery<ContentTopicsType[]>({
    queryKey: ["getTopicsInContentForUser", courseId],
    queryFn: () => getContentTopicsForUser(courseId!),
    enabled: !!courseId,
  });

  const lessonIdNumber = Number(lessonId);

  const isLessonAlreadyCompleted =
    getContentTopicsAndLessons
      ?.flatMap((topic) => topic.lessons)
      .some((lesson) => lesson.id === lessonIdNumber && lesson.isCompleted) ??
    false;

  const { data } = useQuery({
    queryKey: ["getContentLesson", lessonId],
    queryFn: () => getContentLesson(lessonId!),
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

      <div className="container">
        <LessonHeader linkTo={`/user-course-details/${courseId}`} />
        <div className="flex h-full justify-start flex-col gap-6 lg:flex-row">
          <CourseContentCard
            data={getContentTopicsAndLessons ?? []}
            isLoading={isLoading}
            error={error}
          />
          <div className="w-full lg:w-[80%] mb-10">
            <CourseVideo
              key={lessonId}
              isThisLessonAlreadyCompleted={isLessonAlreadyCompleted}
              videoUrl={data?.video ?? ""}
              isOnline={isOnline}
              isLoading={isLoading}
            />

            <LessonActions
              lessonTitle={data?.name ?? ""}
              lessonId={lessonId ?? ""}
            />

            <LessonTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="my-10 mb-30">
              <Suspense fallback={<CircleLoader />}>
                {activeTab === "comments" && <LessonComments />}
                {activeTab === "attachments" && <LessonAttachments />}
                {activeTab === "notes" && <LessonNotes />}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayerPage;
