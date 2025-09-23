import FAQItem from "./FAQItem";

type FAQListProps = {
  faqs: { question: string; answer: string[] }[];
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
