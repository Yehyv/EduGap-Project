import { useState } from "react";

type LessonsListProps = {
  question: string;
  answer: string[];
  indx: number;
};

const LessonsList: React.FC<LessonsListProps> = ({
  question,
  answer,
  indx,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between focus:outline-none cursor-pointer"
      >
        <h5
          className={`${
            isOpen ? "text-secondary" : "text-gray-800"
          } line-clamp-1`}
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
            {answer.map((ans, i) => (
              <li key={i}>{ans}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LessonsList;
