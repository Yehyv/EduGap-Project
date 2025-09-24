import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { getContentDetails } from "@/features/CourseDetails/services/ContentDetails";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { ContentDetailsType } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";

const CourseDetailsPageForGuest = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<ContentDetailsType>({
    queryKey: ["getContentDetails"],
    queryFn: getContentDetails,
  });

  if (isLoading) return <Loader />;
  if (error)
    return (
      <ErrorMessage message={error?.message ?? "Error in content details"} />
    );

  return (
    data && (
      <CourseDetails buttonLink="/" buttonText={t("subscribe")} data={data} />
    )
  );
};
export default CourseDetailsPageForGuest;
