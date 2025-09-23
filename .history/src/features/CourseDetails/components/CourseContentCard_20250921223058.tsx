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
    <div className="w-full xl:sticky overflow-auto top-16 lg:w-[30%] bg-neutral-100 rounded-xl px-6 py-5 min-h-[300px] min-lg:h-[400px]">
      <h5 className="text-lg font-semibold mb-4">{t("about_course")}</h5>
      <section className="py-5 my-6">
        <div className="w-full mx-auto ">
          <div>
            {faqs.map((faq, i) => (
              <LessonsList key={i} {...faq} indx={i + 1} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
export default CourseContentCard;
