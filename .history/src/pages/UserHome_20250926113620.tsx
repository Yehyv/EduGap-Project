import PopularCoursesSlider from "@/shared/components/EduGap/PopularCoursesSlider";
import ProgramsSection from "@/shared/components/EduGap/ProgramsSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";
import RecommendedCourse from "@/features/UserHome/components/RecommendedCourse";
import ContinueWhereLeftOff from "@/shared/components/EduGap/ContinueWhereLeftOff";
import { useEffect, useState } from "react";
import { Loader } from "@/shared/components";
import InstituteCoursesSection from "@/features/UserHome/components/InstituteCoursesSection";
import SavedContentsSlider from "@/shared/components/EduGap/SavedContentsSlider";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) return <Loader />;
  return (
    <>
      <RecommendedCourse
        videoUrl="https://www.w3schools.com/html/mov_bbb.mp4"
        title="التسويق بالذكاء الاصطناعي"
        description="في دورة التسويق بالذكاء الاصطناعي سيكون الهدف الرئيسي هو تمكينك من تعلم المهارات اللازمة للتسويق المناسب لمختلف المنصات بمجهود بسيط وبجودة احترافية تضمن تحقيق نسب عاليه من التسويق"
        buttonText="معرفة المزيد"
        onButtonClick={() => console.log("Start clicked!")}
      />
      <SavedContentsSlider />
      <ContinueWhereLeftOff />
      <PopularCoursesSlider />
      <InstituteCoursesSection />
      <ProgramsSection />
      <Testimonials />
      <Experts />
    </>
  );
};

export default Home;
