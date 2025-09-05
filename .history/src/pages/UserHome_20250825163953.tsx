import { PopularCourses } from "@/shared/components";
import CoursesSection from "@/shared/components/EduGap/CoursesSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";

const Home = () => {
  return (
    <>
      <PopularCourses />
      <CoursesSection />
      <Testimonials />
      <Experts />
    </>
  );
};

export default Home;
