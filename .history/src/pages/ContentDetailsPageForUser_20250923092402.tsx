import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { getContentDetails } from "@/features/CourseDetails/services/contentDetails";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { ContentDetailsType } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";

const CourseDetailsPageForUser = () => {
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
      <CourseDetails
        data={data}
        buttonLink="/course-lesson/1/1"
        buttonText={t("start_learn")}
      />
    )
  );
};

export default CourseDetailsPageForUser;
