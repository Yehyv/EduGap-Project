import TitileLine from "@/assets/svgs/TitileLine.svg?react";
import CheckIcon from "@/assets/svgs/CheckIcon.svg?react";
import TimeLeftIcon from "@/assets/svgs/TimeLeftIcon.svg?react";
import type { CourseType } from "@/shared/types/sharedTypes";
import { useLanguage } from "@/shared/localization/useLanguage";
import { motion } from "framer-motion";

const CourseCardOverlayDetails = ({ course }: { course: CourseType }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileHover={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="
        absolute inset-0 z-10 bg-white/95 backdrop-blur-sm
        p-4 flex flex-col gap-3 overflow-hidden
        pointer-events-auto rounded-xl
      "
      // parent hover trigger
      style={{ pointerEvents: "none" }}
    >
      <motion.div
        className="h-full"
        style={{ pointerEvents: "auto" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {/* Title & Instructor */}
        <div>
          <motion.h3
            key={course?.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            title={course?.name}
            className="font-semibold line-clamp-1 text-secondary text-lg leading-tight mb-1"
          >
            {course?.name}
          </motion.h3>

          <p className="text-sm font-semibold text-gray-400">
            {course.educator?.title} / {course.educator?.name}
          </p>
        </div>

        {/* Info Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <TimeLeftIcon className="inline-block me-1" />
          <span>{course?.totalDuration}</span>
        </motion.div>

        <div className="h-[1px] bg-gray-300 w-full my-1"></div>

        {/* What you'll learn */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full mb-10 overflow-y-auto"
        >
          <h6 className="text-sm font-semibold mb-1">{t("what_to_learn")}</h6>
          <TitileLine className="w-14 -mt-2" />

          <ul className="space-y-2 pr-1 text-sm text-gray-700">
            {course?.whatToLearn?.map((data, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="flex items-start gap-2"
              >
                <CheckIcon className="mt-1 shrink-0" />
                <span>{data}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CourseCardOverlayDetails;
