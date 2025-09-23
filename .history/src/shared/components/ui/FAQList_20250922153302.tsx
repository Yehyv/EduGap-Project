import FAQItem from "./FAQItem";

type FAQListProps = {
  topics: { question: string; answer: string[] }[];
};

const FAQList: React.FC<FAQListProps> = ({ topics }) => {
  return (
    <div className="w-full mx-auto">
      <div>
        {topics?.map((faq, i) => (
          <FAQItem key={i} {...faq} indx={i + 1} />
        ))}
      </div>
    </div>
  );
};

export default FAQList;
