import type { TopicsType } from "@/shared/types/sharedTypes";
import FAQItem from "./FAQItem";

const FAQList = ({ topics }: { topics: TopicsType[] }) => {
  console.log(topics);

  return (
    <div className="w-full mx-auto">
      <div>
        {topics?.map((faq, i) => (
          <FAQItem
            key={i}
            question={faq.name}
            lessons={faq.lessons}
            indx={i + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQList;
