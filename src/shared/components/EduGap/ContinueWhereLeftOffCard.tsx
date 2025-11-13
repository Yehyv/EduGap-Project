import LessonProgress from "@/features/ContentLesson/components/LessonProgress";
import type { ContinueCourseType } from "@/shared/types/sharedTypes";
import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const ContinueWhereLeftOffCard = ({
  course,
}: {
  course: ContinueCourseType;
}) => {
  const educator = course?.educator;
  const courseName = course?.content?.name ?? "دورة بدون عنوان";
  const lessonName = course.lesson.name ?? "—";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [posterFromVideo, setPosterFromVideo] = useState<string>("");

  const videoSrc = course?.lesson?.video || "";

  const capturePoster = () => {
    const v = videoRef.current;
    if (!v) return;

    // Fix tainted canvas issue
    v.crossOrigin = "anonymous";

    try {
      v.currentTime = 1;
    } catch {
      // Do Nothing
    }

    const onSeeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const imgUrl = canvas.toDataURL("image/png");
        setPosterFromVideo(imgUrl);
      } catch {
        // If still tainted → fallback
        setPosterFromVideo("/fallback-placeholder.jpg");
      }

      v.removeEventListener("seeked", onSeeked);
    };

    v.addEventListener("seeked", onSeeked);
  };

  const handleMouseEnter = () => {
    if (!videoSrc) return;
    setIsHovering(true);
    setIsLoading(true);

    const v = videoRef.current;
    if (!v) return;

    const playPromise = v.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => {
        setIsLoading(false);
        setIsPlaying(false);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      // Do Nothing
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => {
      setIsLoading(false);
      if (!posterFromVideo) capturePoster();
    };

    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const onWaiting = () => {
      setIsLoading(true);
      setIsPlaying(false);
    };

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("waiting", onWaiting);

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("waiting", onWaiting);
    };
  }, [videoSrc, posterFromVideo]);

  return (
    <Link
      to={`/course-lesson/${course?.content?.id}/${course?.lesson?.id}`}
      className="group relative w-full bg-white rounded-xl shadow-custom block overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 my-3 p-3 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex-1 mb-3">
        <div className="flex items-center justify-between">
          <h5
            className="font-semibold text-gray-800 line-clamp-1"
            title={lessonName}
          >
            {lessonName}
          </h5>
          <span className="center items-center gap-1 text-sm font-semibold text-yellow-400">
            {course?.rating?.averageRating ?? 0}
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 mb-0.5 text-yellow-400"
              fill="currentColor"
            >
              <path d="M12 .587l3.668 7.568L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.593z" />
            </svg>
          </span>
        </div>
        {educator && (
          <span className="text-sm text-gray-400 line-clamp-1">
            {educator?.title ?? ""} / {educator?.firstName ?? ""}{" "}
            {educator?.lastName ?? ""}
          </span>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden mb-3 mx-4">
        {posterFromVideo ? (
          <img
            src={posterFromVideo}
            alt={lessonName}
            className="w-full h-[200px] object-cover"
          />
        ) : (
          <div className="w-full h-[200px] bg-gray-200"></div>
        )}

        {videoSrc && (
          <video
            ref={videoRef}
            crossOrigin="anonymous"
            muted
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-[200px] object-cover transition-opacity duration-300 
            ${isPlaying ? "opacity-100" : "opacity-0"}`}
            src={videoSrc}
          />
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full"
            >
              <motion.div
                aria-hidden
                className="w-6 h-6 rounded-full border-2 border-t-transparent border-white"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <span className="text-white text-xs">Loading...</span>
            </motion.div>
          </div>
        )}

        {!isPlaying && !isLoading && isHovering && videoSrc && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <LessonProgress courseName={courseName} courseStats={course?.stats} />
    </Link>
  );
};

export default ContinueWhereLeftOffCard;
