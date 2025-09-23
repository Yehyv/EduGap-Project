import type { TopicsType } from "@/shared/types/sharedTypes";
import FAQItem from "./FAQItem";

const FAQList = ({ topics }: { topics: TopicsType }) => {
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
