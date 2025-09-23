import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { getContentDetails } from "@/features/CourseDetails/services/contentDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { ContentDetailsType } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";

const CourseDetailsPageForGuest = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<ContentDetailsType[]>({
    queryKey: ["getContentDetails"],
    queryFn: getContentDetails,
  });

  console.log(data);

  return <CourseDetails buttonLink="/" buttonText={t("subscribe")} />;
};

export default CourseDetailsPageForGuest;
