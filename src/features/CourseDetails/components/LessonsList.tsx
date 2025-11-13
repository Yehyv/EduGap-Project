import type { ContentTopicsType } from "@/shared/types/sharedTypes";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDuration } from "@/shared/utils/globals";
import { useLanguage } from "@/shared/localization/useLanguage";
import { toast } from "react-toastify";

const LessonsList = ({
  indx,
  ContentTopics,
}: {
  indx: number;
  ContentTopics: ContentTopicsType;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { courseId, lessonId } = useParams();
  const { lang, t } = useLanguage();

  const handleLockedClick = () => {
    toast.error(t("complete_prev_lesson"));
  };
  const navigate = useNavigate();
  const handleGoToLesson = (id: number) => {
    navigate(`/course-lesson/${courseId}/${id}`);
  };

  return (
    <div className="py-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between cursor-pointer"
      >
        <h5
          title={ContentTopics?.name}
          className={`font-bold ${
            isOpen ? "text-secondary" : "text-gray-800"
          } line-clamp-1`}
        >
          <span className="mx-1 inline-block text-yellow-500">{indx}.</span>
          {ContentTopics?.name}
        </h5>

        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="mt-3 ms-2 space-y-2 text-gray-600">
              {ContentTopics?.lessons?.map((ans, i) => {
                const isActive = ans?.id == +lessonId!;
                const durationText = formatDuration(ans?.duration, lang);

                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-1"
                    onClick={() => {
                      if (!ans?.isUnlocked) {
                        return handleLockedClick();
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return handleGoToLesson(ans?.id);
                      }
                    }}
                  >
                    <motion.div
                      animate={
                        isActive
                          ? { scale: 1.03, backgroundColor: "#EDF1FF" }
                          : { scale: 1, backgroundColor: "transparent" }
                      }
                      transition={{ duration: 0.25 }}
                      className={`rounded px-1 py-0.5 flex items-center gap-2 flex-1
                        ${
                          !ans?.isUnlocked
                            ? "opacity-40 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      `}
                    >
                      <span className="text-yellow-500">
                        {indx}.{i + 1}
                      </span>
                      {!ans?.isUnlocked ? (
                        <span className="text-gray-500">{ans?.name}</span>
                      ) : (
                        <Link
                          to={`/course-lesson/${courseId}/${ans?.id}`}
                          className={`${
                            isActive
                              ? "text-secondary font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {ans?.name}
                        </Link>
                      )}

                      {/* duration */}
                      <span className="text-xs text-gray-400">
                        ({durationText})
                      </span>

                      {/* Completed Icon */}
                      {ans?.isCompleted && (
                        <span className="text-green-500 text-sm font-bold">
                          ✓
                        </span>
                      )}
                    </motion.div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonsList;
