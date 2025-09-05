import SectionTitle from "@/shared/components/SectionTitle";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import type { CourseTypes } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { getAllGuestPopularCourses } from "@/features/GuestHome/services/GuestHomeApi";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";
import ScrollToTop from "@/shared/utils/ScrollToTop";

const GuestPopularCoursesPage = () => {
  const { data, isLoading, error } = useQuery<CourseTypes[]>({
    queryKey: ["getCoursesList"],
    queryFn: () => getAllGuestPopularCourses("1", "4"),
  });

  if (isLoading) return <Loader />;

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="mb-5 mt-10 container">
      <ScrollToTop />
      <SectionTitle textTitle="الدورات الاكثر شيوعا" />
      <div className="grid grid-cols-4 gap-4">
        {data?.map((courseData, idx) => (
          <CourseCard key={idx} course={courseData} />
        ))}
      </div>
    </div>
  );
};

export default GuestPopularCoursesPage;
