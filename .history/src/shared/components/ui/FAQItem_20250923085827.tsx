import type { LessonType } from "@/shared/types/sharedTypes";
import { useState } from "react";

type FAQItemProps = {
  question: string;
  lessons: LessonType[];
  indx: number;
};

const FAQItem: React.FC<FAQItemProps> = ({ question, lessons, indx }) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log(question);
  console.log(lessons);

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
      </button>
      {isOpen && (
        <div className="mt-3 text-gray-600">
          <ul className="list-decimal ms-6 space-y-2">
            {lessons.map((ans, i) => (
              <li key={i}>{ans}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FAQItem;
