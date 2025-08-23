import HeroSection from "@/features/GuestHome/components/HeroSection";
import { PopularCourses } from "@/shared/components";
import CoursesSection from "@/shared/components/EduGap/CoursesSection";

const GuestHome = () => {
  return (
    <>
      <HeroSection />
      <PopularCourses />
      <CoursesSection />
    </>
  );
};

export default GuestHome;
