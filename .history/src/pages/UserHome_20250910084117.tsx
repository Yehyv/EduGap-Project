import UserPopularCourses from "@/features/UserHome/components/UserPopularCourses";
import CoursesSection from "@/shared/components/EduGap/ProgramsSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";

const Home = () => {
  return (
    <>
      <UserPopularCourses />
      <CoursesSection />
      <Testimonials />
      <Experts />
    </>
  );
};

export default Home;
