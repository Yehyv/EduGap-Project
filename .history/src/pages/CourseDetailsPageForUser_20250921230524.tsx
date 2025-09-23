import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { useLanguage } from "@/shared/localization/useLanguage";

const CourseDetailsPageForUser = () => {
  const { t } = useLanguage();
  return (
    <CourseDetails buttonLink="/lesson/1/1" buttonText={t("start_learn")} />
  );
};

export default CourseDetailsPageForUser;
