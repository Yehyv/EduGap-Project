import type { ContentTopicsType } from "@/shared/types/sharedTypes";
import FAQItem from "./FAQItem";
import { useLanguage } from "@/shared/localization/useLanguage";
import { formatDuration } from "@/shared/utils/globals";

const FAQList = ({ topics }: { topics: ContentTopicsType[] }) => {
  const { t, lang } = useLanguage();
  return (
    <div className="w-full mx-auto">
      <div>
        {topics?.length > 0 ? (
          topics?.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.name}
              lessons={faq.lessons}
              duration={formatDuration(faq.duration ?? 0, lang)}
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
