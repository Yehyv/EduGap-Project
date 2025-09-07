import SectionTitle from "@/shared/components/SectionTitle";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import type { CourseTypes } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { getAllGuestPopularCourses } from "@/features/GuestHome/services/GuestHomeApi";
import ErrorMessage from "@/shared/components/ErrorMessage";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import CustomPagination from "@/shared/utils/CustomPagination";

const GuestPopularCoursesPage = () => {
  const { data, isLoading, error } = useQuery<CourseTypes[]>({
    queryKey: ["getCoursesList"],
    queryFn: () => getAllGuestPopularCourses("1", "4"),
  });

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="mb-5 mt-10 container">
      <ScrollToTop />
      <SectionTitle textTitle="الدورات الاكثر شيوعا" />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {data?.map((courseData, idx) => (
              <CourseCard key={idx} course={courseData} />
            ))}
          </div>
          <CustomPagination
            currentPage={1}
            onPageChange={() => {}}
            totalPages={10}
          />
        </>
      )}
    </div>
  );
};

export default GuestPopularCoursesPage;
