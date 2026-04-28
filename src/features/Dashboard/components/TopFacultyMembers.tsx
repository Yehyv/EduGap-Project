import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FacultyMember {
  id: number;
  name: string;
  activeCourses: number;
  engagement: number;
}

const DUMMY_FACULTY: FacultyMember[] = [
  { id: 1, name: "Dr. Hany Omar", activeCourses: 6, engagement: 94 },
  { id: 2, name: "Dr. Nada Ali", activeCourses: 5, engagement: 89 },
  { id: 3, name: "Dr. Karim Essam", activeCourses: 4, engagement: 85 },
];

const FacultyRow = ({
  member,
  index,
}: {
  member: FacultyMember;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, {
    once: true,
    margin: "-20px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-white"
    >
      {/* Left — name + courses */}
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-gray-900">
          {member.name}
        </span>
        <span className="text-xs text-gray-400">
          {member.activeCourses} active courses
        </span>
      </div>

      {/* Right — engagement badge */}
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{
          duration: 0.35,
          delay: index * 0.1 + 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex-shrink-0 text-xs font-semibold text-white bg-[#1a1a2e] px-4 py-1.5 rounded-full whitespace-nowrap"
      >
        {member.engagement}% engagement
      </motion.span>
    </motion.div>
  );
};

const TopFacultyMembers = () => {
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
          Top Faculty Members
        </h5>
        <p className="text-sm text-gray-400">
          Most active instructors and reviewers.
        </p>
      </motion.div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {DUMMY_FACULTY.map((member, index) => (
          <FacultyRow key={member.id} member={member} index={index} />
        ))}
      </div>
    </div>
  );
};

export default TopFacultyMembers;
