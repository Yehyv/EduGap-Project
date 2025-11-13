import {
  getContentNameAndDuration,
  getContentProgressData,
} from "@/features/CourseDetails/services/contentDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import { formatDuration } from "@/shared/utils/globals";
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

const RightArrow = lazy(() => import("@/assets/svgs/RightArrow.svg?react"));
const TimeIcon = lazy(() => import("@/assets/svgs/TimeIcon.svg?react"));

const LessonHeader = () => {
  const { lang } = useLanguage();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["getContentNameAndDuration", courseId],
    queryFn: () => getContentNameAndDuration(courseId!),
  });

  const { data: progress } = useQuery({
    queryKey: ["getContentProgress", courseId],
    queryFn: () => getContentProgressData(courseId!),
  });

  const percent = progress?.percent ?? 0;

  const count = useMotionValue(0);
  const animatedPercent = useTransform(count, (v) => Math.round(v));

  const [visiblePercent, setVisiblePercent] = useState(0);

  useEffect(() => {
    const unsub = animatedPercent.on("change", (v) => setVisiblePercent(v));
    animate(count, percent, { duration: 1, ease: "easeOut" });
    return () => unsub();
  }, [percent]);

  return (
    <motion.div
      className="flex max-md:flex-col max-md:gap-4 justify-between items-start pt-2 my-1"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
        >
          <Suspense fallback={null}>
            <RightArrow className={lang === "en" ? "rotate-180" : ""} />
          </Suspense>

          <h4 className="m-0 line-clamp-1">{data?.name}</h4>
        </button>

        <div className="flex gap-2 mt-2 text-sm text-secondary">
          <Suspense fallback={null}>
            <TimeIcon className="w-4" />
          </Suspense>

          <span>{formatDuration(data?.totalDuration ?? 0, lang)}</span>
        </div>
      </motion.div>
      <div className="flex items-center gap-2">
        <motion.span
          className="text-secondary font-semibold"
          style={{ opacity: percent > 0 ? 1 : 0.5 }}
        >
          ({progress?.completedLessons ?? 0}/{progress?.totalLessons ?? 0}){" "}
          <span>{visiblePercent}%</span>
        </motion.span>

        <div className="w-[250px] max-md:w-[150px] h-1 bg-gray-300 rounded overflow-hidden">
          <motion.div
            className="h-1 bg-secondary rounded"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LessonHeader;
