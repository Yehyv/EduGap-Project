import PopularCoursesSlider from "@/shared/components/EduGap/PopularCoursesSlider";
import ProgramsSection from "@/shared/components/EduGap/ProgramsSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";
import RecommendedCourse from "@/features/UserHome/components/RecommendedCourse";
import InstituteCoursesSection from "@/features/UserHome/components/InstituteCoursesSection";
import LatestCourses from "@/features/UserHome/components/LatestCourses";
import ContinueWhereLeftOff from "@/shared/components/EduGap/ContinueWhereLeftOff";

const Home = () => {
  return (
    <>
      <RecommendedCourse />,
      <ContinueWhereLeftOff />,
      <PopularCoursesSlider />,
      <InstituteCoursesSection />,
      <LatestCourses />,
      <ProgramsSection />,
      <Testimonials />,
      <Experts />,
    </>
  );
};

export default Home;
