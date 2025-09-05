import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import type { CourseTypes } from "@/shared/types/sharedTypes";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";
import { useQuery } from "@tanstack/react-query";
import { getGuestPopularCourses } from "@/features/GuestHome/services/GuestHomeApi";

const GuestPopularCoursesPage = () => {
  const { data, isLoading, error } = useQuery<CourseTypes[]>({
    queryKey: ["courses"],
    queryFn: getGuestPopularCourses,
  });

  console.log(data);

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle="الدورات الاكثر شيوعا" />
        <GhostButton buttonText="المزيد" to="" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {data?.map((courseData, idx) => (
          <CourseCard key={idx} course={courseData} />
        ))}
      </div>
    </div>
  );
};

export default GuestPopularCoursesPage;
