import { useState } from "react";

type FAQItemProps = {
  question: string;
  answer: string;
  indx: number;
};

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, indx }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="px-6 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between focus:outline-none"
      >
        <h4
          className={`${
            isOpen ? "text-green-400 font-medium" : "text-gray-800"
          }`}
        >
          <span className="mx-2 inline-block">{indx}.</span>
          {question}
        </h4>
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
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

type FAQListProps = {
  faqs: FAQItemProps[];
};

const FAQList: React.FC<FAQListProps> = ({ faqs }) => {
  return (
    <div className="w-full mx-auto">
      <div>
        {faqs.map((faq, i) => (
          <FAQItem key={i} {...faq} indx={i + 1} />
        ))}
      </div>
    </div>
  );
};

export default FAQList;
