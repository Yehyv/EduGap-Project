import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { useLanguage } from "@/shared/localization/useLanguage";

const CourseDetailsPageForUser = () => {
  const { t } = useLanguage();
  return <CourseDetails buttonLink="/" buttonText={t("subscribe")} />;
};

export default CourseDetailsPageForUser;
