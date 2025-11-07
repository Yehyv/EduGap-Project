import { completeLesson } from "@/features/ContentLesson/services/lessonsApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import StatusMessage from "@/shared/utils/StatusMessage";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CourseVideo = ({
  videoUrl,
  isOnline,
  isThisLessonAlreadyCompleted,
}: {
  videoUrl: string;
  isOnline: boolean;
  isThisLessonAlreadyCompleted: boolean;
}) => {
  const { t } = useLanguage();
  const { lessonId, courseId } = useParams();

  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReported, setIsReported] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setVideoError(false);
    setIsReported(false);
  }, [videoUrl]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    if (isThisLessonAlreadyCompleted) return;
  };

  const handleEnded = async () => {
    if (isThisLessonAlreadyCompleted) return;

    if (isReported) return;
    setIsReported(true);

    completeLesson(lessonId ?? "")
      .then(() => {
        toast.success(t("complete_lesson"));
        queryClient.invalidateQueries({
          queryKey: ["getTopicsInContent", courseId],
        });
      })
      .catch(() => {
        console.log("❌ Failed to report completion");
        setIsReported(false);
      });
  };

  return (
    <div className="h-[300px] md:h-[400px]">
      {!isOnline || videoError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl shadow overflow-hidden">
          <StatusMessage
            message={!isOnline ? t("no_internet") : t("failed_to_load")}
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover shadow rounded-xl"
          controls
          onError={() => setVideoError(true)}
          onTimeUpdate={handleTimeUpdate}
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
