import { useLanguage } from "@/shared/localization/useLanguage";

const CourseContentCard = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full xl:sticky top-16 lg:w-[30%] bg-neutral-100 rounded-xl px-6 py-5 min-h-[300px] min-lg:h-[400px]">
      <h5 className="text-lg font-semibold mb-4">{t("about_course")}</h5>
    </div>
  );
};
export default CourseContentCard;
