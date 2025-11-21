import CourseDetails from "@/features/CourseDetails/components/CourseDetails";
import { getBaseContentDetails } from "@/features/CourseDetails/services/contentDetails";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";
import type { ContentDetailsType } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const CourseDetailsPageForGuest = () => {
  const { courseId } = useParams();
  const { data, isLoading, error } = useQuery<ContentDetailsType>({
    queryKey: ["getContentDetailsForGuest"],
    queryFn: () => getBaseContentDetails(courseId ?? ""),
  });

  if (isLoading) return <Loader />;
  if (error)
    return (
      <ErrorMessage message={error?.message ?? "Error in content details"} />
    );
  return data && <CourseDetails isLoading={isLoading} data={data} />;
};
export default CourseDetailsPageForGuest;
