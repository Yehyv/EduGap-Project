import { getCoursePrerequisites } from "@/features/GuestHome/services/GuestHomeApi";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import SectionTitle from "@/shared/components/SectionTitle";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { CoursesResponse } from "@/shared/types/sharedTypes";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const ContentPrerequisites = () => {
  const { t } = useLanguage();

  const { courseId } = useParams();

  const {
    data: coursePrerequisitesData,
    isLoading,
    error,
  } = useQuery<CoursesResponse>({
    queryKey: ["getCoursePrerequisites", courseId],
    queryFn: () => getCoursePrerequisites(courseId),
  });
  return (
    <>
      {error ? (
        <SliderErrorFallback
          componentTitle={`failed to load ${t("pre_req_title")}`}
        />
      ) : (
        <div className="border-t border-[#575757] mt-10 pt-10">
          <SectionTitle lineWidth="w-40" textTitle={t("pre_req_title")} />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                {coursePrerequisitesData?.items?.map((courseData, idx) => (
                  <CourseCard key={idx} course={courseData} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ContentPrerequisites;
