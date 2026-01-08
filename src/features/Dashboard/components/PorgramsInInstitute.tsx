import { useState } from "react";
import PlusIcon from "@/assets/svgs/PlusSign.svg?react";
import PlusIconGray from "@/assets/svgs/PlusIconGray.svg?react";
import TrashIcon from "@/assets/svgs/TrashIconDashboard.svg?react";
import AddCourseToProgram from "./AddCourseToProgram";
import AddProgramToInstitute from "./AddProgramToInstitute";

/* ===== Icons ===== */
const ArrowDown = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUp = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <path
      d="M18 15l-6-6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ===== Dummy Data ===== */
const programs = [
  {
    id: 1,
    title: "برنامج التسويق",
    courses: ["إعلانات جوجل", "إعلانات فيسبوك", "تحسين محركات البحث"],
  },
  {
    id: 2,
    title: "برنامج البرمجة",
    courses: ["JavaScript", "React", "Laravel"],
  },
  {
    id: 3,
    title: "برنامج التصميم",
    courses: ["UI/UX", "Figma", "Photoshop"],
  },
];

const PorgramsInInstitute = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [reviewCourseModalOpen, setReviewCourseModalOpen] = useState(false);
  const [reviewProgramModalOpen, setReviewProgramModalOpen] = useState(false);
  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white p-5 rounded-lg">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center border-b border-[#ACACAC] pb-3">
        <h4 className="text-secondary font-bold">Programs</h4>

        <button
          onClick={() => setReviewProgramModalOpen(true)}
          className="bg-gradient-to-r from-[#FCB737] to-[#BB831A] center py-1.5 px-3 rounded-xl shadow-md hover:to-[#FCB737] transition text-white text-sm"
        >
          <PlusIcon className="h-5 me-1" />
          Add Program To Institute
        </button>
      </div>

      {/* ===== Programs List ===== */}
      <div className="mt-4 space-y-3">
        {programs.map((program) => {
          const isOpen = openId === program.id;

          return (
            <div
              key={program.id}
              className="border border-[#E0E0E0] rounded-lg overflow-hidden"
            >
              {/* ===== Program Header ===== */}
              <button
                type="button"
                onClick={() => toggle(program.id)}
                className="w-full flex justify-between items-center px-4 py-3 bg-[#F9F8F8] hover:bg-[#F1F1F1] transition"
              >
                <h6 className="font-semibold text-gray-800">{program.title}</h6>

                <div className="flex justify-between gap-5">
                  <span className="text-secondary">
                    {isOpen ? <ArrowUp /> : <ArrowDown />}
                  </span>
                  <button className="cursor-pointer">
                    <TrashIcon />
                  </button>
                </div>
              </button>

              {/* ===== Collapse Body ===== */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <ul className="px-8 py-3 space-y-2 text-sm text-gray-700">
                  {program.courses.map((course, index) => (
                    <li
                      key={index}
                      className="list-disc flex justify-between marker:text-secondary marker:text-lg bg-[#F7FCFF] p-3 rounded-xl"
                    >
                      <span>
                        {index + 1} - {course}
                      </span>
                      <button className="cursor-pointer">
                        <TrashIcon />
                      </button>
                    </li>
                  ))}
                  <button
                    onClick={() => setReviewCourseModalOpen(true)}
                    className="mt-10 w-full center gap-1 dashed-border rounded-lg py-1.5 cursor-pointer text-[#808080]"
                  >
                    Add Course
                    <PlusIconGray />
                  </button>
                </ul>
              </div>
              <AddCourseToProgram
                programId={program.id}
                reviewModalOpen={reviewCourseModalOpen}
                setReviewModalOpen={setReviewCourseModalOpen}
              />

              <AddProgramToInstitute
                reviewModalOpen={reviewProgramModalOpen}
                setReviewModalOpen={setReviewProgramModalOpen}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PorgramsInInstitute;
