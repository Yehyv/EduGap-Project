import type { LessonType } from "@/shared/types/sharedTypes";
import { useState } from "react";

type FAQItemProps = {
  question: string;
  lessons: LessonType[];
  indx: number;
  duration: number;
};

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  lessons,
  indx,
  duration,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between focus:outline-none cursor-pointer"
      >
        <h5
          className={`${isOpen ? "text-secondary" : "text-gray-800"} text-lg`}
        >
          <span className="mx-1 inline-block text-yellow-500">{indx}.</span>
          {question}
        </h5>
        <div className="flex gap-2">
          {duration >= 0 && <span className="text-[#797979]">{duration}</span>}
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="mt-3 text-gray-600">
          <ul className="list-decimal ms-6 space-y-2">
            {lessons.map((ans, i) => (
              <li key={i} className="flex justify-between px-2">
                <span>{ans?.name}</span>
                {ans?.duration >= 0 && (
                  <span className="text-[#797979]">{ans.duration}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FAQItem;
