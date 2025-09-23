import { useState } from "react";

type FAQItemProps = {
  question: string;
  answer: string;
};

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="tw-px-6 tw-py-6 border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="tw-flex tw-w-full tw-items-center tw-justify-between focus:tw-outline-none"
      >
        <h4
          className={`${
            isOpen ? "tw-text-green-400 tw-font-medium" : "tw-text-gray-800"
          }`}
        >
          {question}
        </h4>
        <svg
          className={`tw-w-5 tw-h-5 tw-text-gray-500 tw-transform transition-transform ${
            isOpen ? "tw-rotate-180" : ""
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
        <div className="tw-mt-3 tw-text-gray-600">
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
    <div className="tw-max-w-3xl tw-mx-auto tw-py-12">
      <h2 className="tw-text-3xl tw-text-green-400 tw-mb-8">
        Frequently Asked Questions
      </h2>
      <div className="tw-bg-white tw-rounded-lg tw-shadow">
        {faqs.map((faq, i) => (
          <FAQItem key={i} {...faq} />
        ))}
      </div>
    </div>
  );
};

export default FAQList;
