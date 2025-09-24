import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { getContentDetailsForEnrolledUsers } from "@/features/CourseDetails/services/contentDetails";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { ContentDetailsType } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const CourseDetailsPageForUser = () => {
  const { courseId } = useParams();
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<ContentDetailsType>({
    queryKey: ["getContentDetailsForEnrolledUsers"],
    queryFn: () => getContentDetailsForEnrolledUsers(courseId ?? ""),
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
