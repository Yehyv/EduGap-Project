import SectionTitle from "@/shared/components/SectionTitle";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import type { CoursesResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { getAllPopularCourses } from "@/features/GuestHome/services/GuestHomeApi";
import ErrorMessage from "@/shared/components/ErrorMessage";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import CustomPagination from "@/shared/utils/CustomPagination";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useSearchParams } from "react-router-dom";
import { RESULTS_PER_PAGE } from "@/shared/utils/globals";

const UserPopularCoursePage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading, error } = useQuery<CoursesResponse>({
    queryKey: ["getUserCoursesList", page],
    queryFn: () => getAllPopularCourses(page.toString(), RESULTS_PER_PAGE),
  });
  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (error) return <ErrorMessage message={error?.message} />;

  return (
    <div className="mb-5 mt-10 container">
      <ScrollToTop />
      <SectionTitle textTitle={t("courses_title")} />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.formattedContents?.map((courseData, idx) => (
              <CourseCard key={idx} course={courseData} />
            ))}
          </div>
          <CustomPagination
            currentPage={data?.pagination.page ?? 1}
            onPageChange={handlePageChange}
            totalPages={data?.pagination.totalPages ?? 1}
          />
        </>
      )}
    </div>
  );
};

export default UserPopularCoursePage;
