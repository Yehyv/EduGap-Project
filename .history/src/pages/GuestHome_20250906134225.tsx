import GuestPopularCourses from "@/features/GuestHome/components/GuestPopularCourses";
import HeroSection from "@/features/GuestHome/components/HeroSection";
import CoursesSection from "@/shared/components/EduGap/CoursesSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";
import withLoader from "@/shared/hooks/withLoader";

const GuestHome = () => {
  return (
    <>
      <HeroSection />
      <GuestPopularCourses />
      <CoursesSection />
      <Testimonials />
      <Experts />
    </>
  );
};

export default withLoader(GuestHome);
