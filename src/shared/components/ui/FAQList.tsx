import type { ContentTopicsType } from "@/shared/types/sharedTypes";
import FAQItem from "./FAQItem";
import { useLanguage } from "@/shared/localization/useLanguage";

const FAQList = ({ topics }: { topics: ContentTopicsType[] }) => {
  const { t } = useLanguage();
  return (
    <div className="w-full mx-auto">
      <div>
        {topics?.length > 0 ? (
          topics?.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.name}
              lessons={faq.lessons}
              duration={faq.duration}
              indx={i + 1}
            />
          ))
        ) : (
          <p>{t("no_data_available")}</p>
        )}
      </div>
    </div>
  );
};

export default FAQList;
