import HeroSection from "@/features/GuestHome/components/HeroSection";
import { PopularCourses } from "@/shared/components";
import CoursesSection from "@/shared/components/EduGap/CoursesSection";
import Testimonials from "@/shared/components/EduGap/Testimonials";

const GuestHome = () => {
  return (
    <>
      <HeroSection />
      <PopularCourses />
      <CoursesSection />
      <Testimonials />
    </>
  );
};

export default GuestHome;
