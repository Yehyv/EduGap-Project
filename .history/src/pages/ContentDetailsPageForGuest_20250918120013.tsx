import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { useLanguage } from "@/shared/localization/useLanguage";

const CourseDetailsPageForGuest = () => {
  const { t } = useLanguage();
  return <CourseDetails buttonLink="/" buttonText={t("subscribe")} />;
};

export default CourseDetailsPageForGuest;
