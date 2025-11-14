import { completeLesson } from "@/features/ContentLesson/services/lessonsApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import StatusMessage from "@/shared/utils/StatusMessage";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CircleLoader from "../ui/CircleLoader";

const CourseVideo = ({
  videoUrl,
  isOnline,
  isThisLessonAlreadyCompleted,
  isLoading = false,
  videoHeight = "md:h-[400px]",
}: {
  videoUrl: string;
  isOnline: boolean;
  isThisLessonAlreadyCompleted: boolean;
  videoHeight?: string;
  isLoading?: boolean;
}) => {
  const { t } = useLanguage();
  const { lessonId, courseId } = useParams();
  const [videoError, setVideoError] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const queryClient = useQueryClient();

  // Reset states when video changes
  useEffect(() => {
    setVideoError(false);
    setIsReported(false);
    setRetryCount(0);
  }, [videoUrl]);

  // Retry logic for video load
  const handleVideoError = () => {
    if (retryCount < 3) {
      setRetryCount(retryCount + 1);
      // Reload video with a cache-busting query param
      if (videoRef.current) {
        videoRef.current.src = `${videoUrl}?retry=${retryCount + 1}`;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    } else {
      setVideoError(true);
    }
  };

  const handleEnded = async () => {
    if (isThisLessonAlreadyCompleted || isReported) return;
    setIsReported(true);

    try {
      await completeLesson(lessonId ?? "");
      toast.success(t("complete_lesson"));
      queryClient.invalidateQueries({
        queryKey: ["getTopicsInContentForUser", courseId],
      });
    } catch {
      console.log("❌ Failed to report completion");
      setIsReported(false);
    }
  };

  return (
    <div className={`h-[300px] ${videoHeight}`}>
      {!isOnline ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl shadow overflow-hidden">
          <StatusMessage message={t("no_internet")} />
        </div>
      ) : videoError && !isLoading ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl shadow overflow-hidden">
          <CircleLoader />
        </div>
      ) : isLoading ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl shadow overflow-hidden">
          <StatusMessage message={t("loading")} />
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover shadow rounded-xl"
          controls
          onError={handleVideoError}
          onEnded={handleEnded}
        >
          <source src={videoUrl} type="video/mp4" />
          {t("failed_to_load")}
        </video>
      )}
    </div>
  );
};

export default CourseVideo;
