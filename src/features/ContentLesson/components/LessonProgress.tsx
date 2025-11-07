import type { statsType } from "@/shared/types/sharedTypes";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

const LessonProgress = ({
  courseName,
  courseStats,
}: {
  courseName: string;
  courseStats: statsType;
}) => {
  const completed = courseStats?.completedLessons ?? 0;
  const total = courseStats?.totalLessons ?? 0;
  const percent = courseStats?.percent ?? 0;

  // Animated number with framer motion
  const count = useMotionValue(0);
  const animatedPercent = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    animate(count, percent, {
      duration: 1,
      ease: "easeOut",
    });
  }, [percent, count]);

  return (
    <>
      <div className="px-4 flex items-center gap-1 text-sm text-secondary w-full">
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-secondary"
          />
        </div>
        <div className="flex justify-between items-center">
          <motion.span className="font-semibold">
            {animatedPercent.get()}%
          </motion.span>
        </div>
      </div>
      <div className="flex text-secondary text-sm mt-2">
        <span className="line-clamp-1 flex-1 pe-3">{courseName}</span>
        <span className="whitespace-nowrap pe-3">
          {completed}/{total}
        </span>
      </div>
    </>
  );
};

export default LessonProgress;
