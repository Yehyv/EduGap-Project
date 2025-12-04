import PopularCoursesSlider from "@/shared/components/EduGap/PopularCoursesSlider";
import HeroSection from "@/features/GuestHome/components/HeroSection";
import ProgramsSection from "@/shared/components/EduGap/ProgramsSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";

const GuestHome = () => {
  return (
    <>
      <HeroSection />
      <PopularCoursesSlider />
      <ProgramsSection />
      <Testimonials />
      <Experts />
    </>
  );
};

export default GuestHome;
