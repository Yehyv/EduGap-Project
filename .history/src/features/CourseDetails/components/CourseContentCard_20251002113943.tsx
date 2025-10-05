import { useLanguage } from "@/shared/localization/useLanguage";
import LessonsList from "./LessonsList";
import StarIcon from "@/assets/svgs/BlackStarIcon.svg?react";
import WriteIcon from "@/assets/svgs/WriteIcon.svg?react";
import AttachementIcon from "@/assets/svgs/AttachmentIcon.svg?react";
import ExpertIcon from "@/assets/svgs/ExpertIcon.svg?react";
import ComputerIcon from "@/assets/svgs/ComputerIcon.svg?react";
import UserImage from "@/assets/svgs/UserIcon.svg";
import StarYellowIcon from "@/assets/svgs/StarIcon.svg?react";
import { LightButton } from "@/shared/components";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <div className="w-full lg:w-[30%] min-lg:min-h-full min-lg:h-[400px]">
      <div className="shadow-custom overflow-auto top-16 rounded-xl py-5 min-lg:h-[400px]">
        <h5 className="flex gap-2 text-lg font-semibold mb-4 border-b pb-3 border-[#D0CDCD] px-5">
          <ComputerIcon />
          <span>{t("course_content")}</span>
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
      <h5 className="cursor-pointer mt-2 flex gap-2 shadow-custom overflow-auto top-16 rounded-xl px-5 py-2 font-semibold">
        <StarIcon className="inline-block" />
        <span>الدروس الهامة</span>
      </h5>
      <h5 className="cursor-pointer mt-2 flex gap-2 shadow-custom overflow-auto top-16 rounded-xl px-5 py-2 font-semibold">
        <WriteIcon className="inline-block" />
        <span>ملاحظاتي</span>
      </h5>
      <h5 className="cursor-pointer mt-2 flex gap-2 shadow-custom overflow-auto top-16 rounded-xl px-5 py-2 font-semibold">
        <AttachementIcon className="inline-block" />
        <span>مرفقات الدورة</span>
      </h5>
      <div className="shadow-custom overflow-auto top-16 rounded-xl py-5 min-lg:h-[400px]">
        <h5 className="flex gap-2 text-lg font-semibold mb-4 border-b pb-3 border-[#D0CDCD] px-5">
          <ExpertIcon />
          <span>{t("expert")}</span>
        </h5>
        <section className="px-6 my-2">
          <div className="w-full flex gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={UserImage} className="w-full object-cover" alt="user" />
            </div>
            <div className="text-start w-full">
              <div className="flex justify-between">
                <h5>حسام رفعت </h5>
                <div className="center items-center gap-2 text-end text-[#FABC03]">
                  <StarYellowIcon className="inline-block w-5 h-5" />
                  <span className="inline-block">4.8</span>
                </div>
              </div>
              <h6 className="text-[#939393] text-sm">خبير تسويق</h6>
            </div>
            <LightButton
              text="المزيد عن الخبير"
              onClick={() => {
                navigate("/expert/1");
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
export default CourseContentCard;
