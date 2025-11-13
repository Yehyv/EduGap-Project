import { useUser } from "@/features/auth/context/UserContext";
import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { getBaseContentDetails } from "@/features/CourseDetails/services/contentDetails";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";
import type { ContentDetailsType } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const CourseDetailsPageForUser = () => {
  const { courseId } = useParams();
  const { user } = useUser();
  const { data, isLoading, error } = useQuery<ContentDetailsType>({
    queryKey: ["getContentDetailsForEnrolledUsers", courseId, user?.programId],
    queryFn: () => getBaseContentDetails(courseId!, user!.programId!),
  });

  if (isLoading) return <Loader />;
  if (error)
    return (
      <ErrorMessage message={error?.message ?? "Error in content details"} />
    );

  return data && <CourseDetails data={data} />;
};

export default CourseDetailsPageForUser;
