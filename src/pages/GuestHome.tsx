// =======================
// GuestHome.tsx
// =======================
import PopularCoursesSlider from "@/shared/components/EduGap/PopularCoursesSlider";
import HeroSection from "@/features/GuestHome/components/HeroSection";
import ProgramsSection from "@/shared/components/EduGap/ProgramsSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const SectionContainer = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={container}
  >
    {children}
  </motion.div>
);

const SectionItem = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={item}>{children}</motion.div>
);

// GuestHome component only
const GuestHome = () => {
  return (
    <>
      <HeroSection />

      <SectionContainer>
        <SectionItem>
          <PopularCoursesSlider />
        </SectionItem>
      </SectionContainer>

      <SectionContainer>
        <SectionItem>
          <ProgramsSection />
        </SectionItem>
      </SectionContainer>

      <SectionContainer>
        <SectionItem>
          <Testimonials />
        </SectionItem>
      </SectionContainer>

      <SectionContainer>
        <SectionItem>
          <Experts />
        </SectionItem>
      </SectionContainer>
    </>
  );
};

export default GuestHome;
