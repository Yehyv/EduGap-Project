import UserPopularCourses from "@/features/UserHome/components/UserPopularCourses";
import CoursesSection from "@/shared/components/EduGap/ProgramsSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";
import RecommendedCourse from "@/features/UserHome/components/recommendedCourse";

const Home = () => {
  return (
    <>
      <RecommendedCourse
        videoUrl="https://www.w3schools.com/html/mov_bbb.mp4"
        title="التسويق بالذكاء الاصطناعي"
        description="في دورة التسويق بالذكاء الاصطناعي سيكون الهدف الرئيسي هو تمكينك من تعلم المهارات اللازمة للتسويق المناسب لمختلف المنصات بمجهود بسيط وبجودة احترافية تضمن تحقيق نسب عاليه من التسويق"
        buttonText="معرفة المزيد"
        onButtonClick={() => console.log("Start clicked!")}
      />
      <UserPopularCourses />
      <CoursesSection />
      <Testimonials />
      <Experts />
    </>
  );
};

export default Home;
