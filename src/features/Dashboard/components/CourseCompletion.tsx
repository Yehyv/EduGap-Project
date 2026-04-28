import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Course {
  name: string;
  completion: number;
}

const DUMMY_COURSES: Course[] = [
  { name: "Data Analysis", completion: 82 },
  { name: "Power BI", completion: 74 },
  { name: "SQL Basics", completion: 69 },
  { name: "Business Writing", completion: 88 },
  { name: "AI Tools", completion: 77 },
];

const CourseRow = ({ course, index }: { course: Course; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, {
    once: true,
    margin: "-20px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-800">{course.name}</span>
        <motion.span
          className="text-sm font-semibold text-gray-900"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.08 + 0.3 }}
        >
          {course.completion}%
        </motion.span>
      </div>

      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#1a1a2e]"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${course.completion}%` } : { width: 0 }}
          transition={{
            duration: 1.1,
            delay: index * 0.08 + 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
    </motion.div>
  );
};

const CourseCompletion = () => {
  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-custom overflow-hidden p-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-5"
      >
        <h5 className="text-lg font-semibold text-gray-900 mb-0.5">
          Course Completion
        </h5>
        <p className="text-sm text-gray-400">
          Top course performance within the institution.
        </p>
      </motion.div>

      {/* Rows */}
      <div className="flex flex-col gap-4">
        {DUMMY_COURSES.map((course, index) => (
          <CourseRow key={course.name} course={course} index={index} />
        ))}
      </div>
    </div>
  );
};

export default CourseCompletion;
