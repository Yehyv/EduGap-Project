import PopularCoursesSlider from "@/shared/components/EduGap/PopularCoursesSlider";
import ProgramsSection from "@/shared/components/EduGap/ProgramsSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";
import RecommendedCourse from "@/features/UserHome/components/RecommendedCourse";

import InstituteCoursesSection from "@/features/UserHome/components/InstituteCoursesSection";
import LatestCourses from "@/features/UserHome/components/LatestCourses";
import ContinueWhereLeftOff from "@/shared/components/EduGap/ContinueWhereLeftOff";
import { motion } from "framer-motion";

const fadeVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={fadeVariants}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const sections = [
    <RecommendedCourse key="recommended" />,
    <ContinueWhereLeftOff key="continue" />,
    <PopularCoursesSlider key="popular" />,
    <InstituteCoursesSection key="institute" />,
    <LatestCourses key="latest" />,
    <ProgramsSection key="programs" />,
    <Testimonials key="testimonials" />,
    <Experts key="experts" />,
  ];

  return (
    <>
      {sections.map((Component, index) => (
        <AnimatedSection key={index}>{Component}</AnimatedSection>
      ))}
    </>
  );
};

export default Home;
