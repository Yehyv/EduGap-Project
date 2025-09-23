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
import PopularCoursesList from "@/shared/components/EduGap/PopularCoursesList";

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
      <PopularCoursesList />
    </div>
  );
};

export default UserPopularCoursePage;
