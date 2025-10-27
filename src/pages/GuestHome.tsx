import PopularCoursesSlider from "@/shared/components/EduGap/PopularCoursesSlider";
import HeroSection from "@/features/GuestHome/components/HeroSection";
import ProgramsSection from "@/shared/components/EduGap/ProgramsSection";
import Experts from "@/shared/components/EduGap/Experts";
// import Testimonials from "@/shared/components/EduGap/Testimonials";
import withLoader from "@/shared/hooks/withLoader";

const GuestHome = () => {
  return (
    <>
      <HeroSection />
      <PopularCoursesSlider />
      <ProgramsSection />
      {/* <Testimonials /> */}
      <Experts />
    </>
  );
};

const GuestHomeWithLoader = withLoader(GuestHome);

export default GuestHomeWithLoader;
