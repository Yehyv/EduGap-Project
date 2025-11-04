import type { ContentTopicsType } from "@/shared/types/sharedTypes";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const LessonsList = ({
  indx,
  ContentTopics,
}: {
  indx: number;
  ContentTopics: ContentTopicsType;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { courseId, lessonId } = useParams();

  return (
    <div className="py-3">
      {/* Header button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between focus:outline-none cursor-pointer"
      >
        <h5
          title={ContentTopics?.name}
          className={`${
            isOpen ? "text-secondary" : "text-gray-800"
          } line-clamp-1`}
        >
          <span className="mx-1 inline-block text-yellow-500">{indx}.</span>
          {ContentTopics?.name}
        </h5>

        {/* Rotate icon smoothly */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </motion.svg>
      </button>

      {/* Animated Lessons List */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="lessons-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="mt-3 list-decimal ms-6 space-y-2 text-gray-600">
              {ContentTopics?.lessons?.map((ans, i) => (
                <motion.li
                  key={i}
                  className="text-amber-500"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/course-lesson/${courseId}/${ans?.id}`}
                    className={`${
                      ans?.id == +lessonId! ? "text-secondary font-medium" : ""
                    }`}
                  >
                    {ans?.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonsList;
