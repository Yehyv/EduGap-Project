import { useUser } from "@/features/auth/context/UserContext";
import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import {
  getContentAccessStatusForUser,
  getContentDetailsForEnrolledUsers,
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
    queryFn: () =>
      getContentDetailsForEnrolledUsers(courseId!, user!.programId!),
    enabled: !!user?.programId && !!courseId,
  });
  const { data: contentAccessStatus } = useQuery<ContentAccessType>({
    queryKey: ["getContentAccessStatus", courseId],
    queryFn: () => getContentAccessStatusForUser(courseId!),
    enabled: !!courseId,
  });
  console.log(contentAccessStatus);

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
