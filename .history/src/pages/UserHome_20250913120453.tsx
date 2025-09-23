import UserPopularCourses from "@/features/UserHome/components/UserPopularCourses";
import CoursesSection from "@/shared/components/EduGap/ProgramsSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";
import RecommendedCourse from "@/features/UserHome/components/recommendedCourse";

const Home = () => {
  return (
    <>
      {/* <RecommendedCourse
        videoUrl="https://www.w3schools.com/html/mov_bbb.mp4"
        title="Learn Anytime, Anywhere"
        description="Our platform gives you the freedom to learn at your own pace."
        buttonText="Start Learning"
        onButtonClick={() => console.log("Start clicked!")}
      /> */}
      {/* <UserPopularCourses /> */}
      <CoursesSection />
      <Testimonials />
      <Experts />
    </>
  );
};

export default Home;
