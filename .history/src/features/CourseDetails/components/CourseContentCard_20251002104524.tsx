import { useLanguage } from "@/shared/localization/useLanguage";
import LessonsList from "./LessonsList";
const faqs = [
  {
    question: "فهم ما هو الذكاء الاصناعي",
    answer: ["تعريف الذكاء الاصناعي", "أهمية الذكاء الاصناعي"],
  },
  {
    question: "استخدام الذكاء الاصطناعي في الاعمال",
    answer: ["فهم ما هو الذكاء الاصناعي", "أهمية الذكاء الاصناعي"],
  },
  {
    question: "استخدام الذكاء الاصطناعي",
    answer: ["فهم ما هو الذكاء الاصناعي", "أهمية الذكاء الاصناعي"],
  },
];
const CourseContentCard = () => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="w-full shadow-custom overflow-auto top-16 lg:w-[30%] rounded-xl py-5 min-lg:min-h-full min-lg:h-[400px]">
        <h5 className="text-lg font-semibold mb-4 border-b-2 pb-3 border-[#D0CDCD] px-6">
          {t("course_content")}
        </h5>
        <section className="px-6 my-2">
          <div className="w-full mx-auto ">
            <div>
              {faqs.map((faq, i) => (
                <LessonsList key={i} {...faq} indx={i + 1} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="w-full shadow-custom overflow-auto top-16 lg:w-[30%] rounded-xl py-5 min-lg:min-h-full min-lg:h-[400px]"></div>
    </div>
  );
};
export default CourseContentCard;
