import HeroSection from "@/features/GuestHome/components/HeroSection";
import { Loader, PopularCourses } from "@/shared/components";
import CoursesSection from "@/shared/components/EduGap/CoursesSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";

const GuestHome = () => {
  return (
    <>
      <HeroSection />
      <PopularCourses />
      <CoursesSection />
      <Testimonials />
      <Experts />
    </>
  );
};

export default GuestHome;
