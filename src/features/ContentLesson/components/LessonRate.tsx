import RateIcon from "@/assets/svgs/RateIcon.svg?react";
import RatingReview from "@/shared/components/ui/RatingReview";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useParams } from "react-router-dom";

const LessonRate = () => {
  const { t } = useLanguage();
  const { courseId } = useParams();

  return (
    <div className="shadow-custom overflow-auto top-16 rounded-xl py-5">
      <h5 className="flex gap-2 text-lg font-semibold mb-4 border-b pb-3 border-[#D0CDCD] px-5">
        <RateIcon />
        <span>{t("rate_course")}</span>
      </h5>

      <section className="px-6 my-3 text-center">
        <p className="mb-2 text-gray-700">{t("rate_course_description")}</p>

        <div className="flex justify-center">
          <RatingReview courseId={courseId ?? ""} />
        </div>
      </section>
    </div>
  );
};

export default LessonRate;
