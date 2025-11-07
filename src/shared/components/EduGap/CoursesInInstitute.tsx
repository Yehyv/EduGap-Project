import CourseCard from "@/shared/components/EduGap/CourseCard";
import type { CoursesResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { getAllCoursesInInstituteContent } from "@/features/GuestHome/services/GuestHomeApi";
import ErrorMessage from "@/shared/components/ErrorMessage";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import CustomPagination from "@/shared/utils/CustomPagination";
import { useParams, useSearchParams } from "react-router-dom";
import { RESULTS_PER_PAGE } from "@/shared/utils/globals";
import { useLanguage } from "@/shared/localization/useLanguage";

const CoursesInInstitute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const page = Number(searchParams.get("page")) || 1;
  const { instituteCourseId } = useParams();

  const { data, isLoading, error } = useQuery<CoursesResponse>({
    queryKey: ["getAllCoursesInProgram", instituteCourseId, page],
    queryFn: () =>
      getAllCoursesInInstituteContent(
        instituteCourseId ?? "",
        page,
        RESULTS_PER_PAGE
      ),
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (error) return <ErrorMessage message={error?.message} />;

  const hasCourses = data && data.items && data.items.length > 0;

  return (
    <div className="mb-5 my-10">
      <ScrollToTop />

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : hasCourses ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.items.map((courseData, idx) => (
              <CourseCard key={idx} course={courseData} />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination?.totalPages > 1 && (
            <CustomPagination
              currentPage={data.pagination.page}
              onPageChange={handlePageChange}
              totalPages={data.pagination.totalPages}
            />
          )}
        </>
      ) : (
        // ✅ No Courses Message UI
        <div className="text-center text-gray-500 bg-gray-100 py-6 rounded-xl mt-6 text-base font-medium">
          {t("no_courses_available")}
        </div>
      )}
    </div>
  );
};

export default CoursesInInstitute;
