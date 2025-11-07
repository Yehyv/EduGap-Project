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

  /**  Extract frame as poster after 1 second */
  const capturePoster = () => {
    const v = videoRef.current;
    if (!v) return;

    try {
      v.currentTime = 1; // jump to second 1
    } catch {
      // stop
    }

    const onSeeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      setPosterFromVideo(canvas.toDataURL("image/png"));
      v.removeEventListener("seeked", onSeeked);
    };

    v.addEventListener("seeked", onSeeked);
  };

  /** ✅ Play on hover */
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

  /** ✅ Stop on leave */
  const handleMouseLeave = () => {
    setIsHovering(false);
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      // stop
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  /** ✅ Events Listeners */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => {
      setIsLoading(false);
      // ✅ ONLY generate poster once
      if (!posterFromVideo) {
        capturePoster();
      }
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
      {/* Lesson Info */}
      <div className="flex-1 mb-3">
        <h5
          className="font-semibold text-gray-800 line-clamp-1"
          title={lessonName}
        >
          {lessonName}
        </h5>

        <div className="flex justify-between items-center mt-1">
          {educator && (
            <span className="text-sm text-gray-400 line-clamp-1">
              {educator?.title ?? ""} / {educator?.firstName ?? ""}{" "}
              {educator?.lastName ?? ""}
            </span>
          )}
          <span className="text-sm font-semibold text-yellow-400">
            {course?.content?.rate ?? 0}
          </span>
        </div>
      </div>

      {/* Poster & Video */}
      <div className="relative rounded-xl overflow-hidden mb-3 mx-4">
        {posterFromVideo ? (
          <img
            src={posterFromVideo || "/fallback-placeholder.jpg"}
            alt={lessonName}
            crossOrigin="anonymous"
            className="w-full h-[200px] object-cover"
          />
        ) : (
          <div className="w-full h-[200px] bg-gray-200"></div>
        )}

        {videoSrc && (
          <video
            ref={videoRef}
            muted
            crossOrigin="anonymous"
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-[200px] object-cover transition-opacity duration-300 
            ${isPlaying ? "opacity-100" : "opacity-0"}`}
            src={videoSrc}
          />
        )}

        {/* ✅ Loader */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
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

        {/* Play icon when hovering but not yet playing */}
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
