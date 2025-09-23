import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { getContentDetails } from "@/features/CourseDetails/services/contentDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { ContentDetailsType } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";

const CourseDetailsPageForGuest = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<ContentDetailsType>({
    queryKey: ["getContentDetails"],
    queryFn: getContentDetails,
  });

  return (
    data && (
      <CourseDetails buttonLink="/" buttonText={t("subscribe")} data={data} />
    )
  );
};
export default CourseDetailsPageForGuest;
