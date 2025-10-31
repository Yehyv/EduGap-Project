import { useUser } from "@/features/auth/context/UserContext";
import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import {
  getBaseContentDetails,
  getContentAccessStatusForUser,
} from "@/features/CourseDetails/services/contentDetails";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import type {
  ContentAccessType,
  ContentDetailsType,
} from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const CourseDetailsPageForUser = () => {
  const { courseId } = useParams();
  const { t } = useLanguage();
  const { user } = useUser();
  const { data, isLoading, error } = useQuery<ContentDetailsType>({
    queryKey: ["getContentDetailsForEnrolledUsers", courseId, user?.programId],
    queryFn: () => getBaseContentDetails(courseId!, user!.programId!),
    enabled: !!user?.programId && !!courseId,
  });
  const { data: contentAccessStatus } = useQuery<ContentAccessType>({
    queryKey: ["getContentAccessStatus", courseId],
    queryFn: () => getContentAccessStatusForUser(courseId!),
    enabled: !!courseId,
  });
  const isEnroled = contentAccessStatus?.access === "enrolled";

  if (isLoading) return <Loader />;
  if (error)
    return (
      <ErrorMessage message={error?.message ?? "Error in content details"} />
    );

  return (
    data && (
      <CourseDetails
        isLoggedIn={true}
        isEnrolled={isEnroled}
        data={data}
        buttonLink={`/course-lesson/${courseId}/1`}
        buttonText={isEnroled ? t("Continue_Learning") : t("start_learn")}
      />
    )
  );
};

export default CourseDetailsPageForUser;
