import SectionTitle from "@/shared/components/SectionTitle";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import type { CourseTypes } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { getAllGuestPopularCourses } from "@/features/GuestHome/services/GuestHomeApi";
import { Loader } from "@/shared/components";

const GuestPopularCoursesPage = () => {
  const { data, isLoading, error } = useQuery<CourseTypes[]>({
    queryKey: ["courses"],
    queryFn: () => getAllGuestPopularCourses("1", "4"),
  });

  console.log(data);

  if (isLoading) return <Loader />;

  return (
    <div className="mb-5 mt-10 container">
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
