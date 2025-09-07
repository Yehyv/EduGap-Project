import GuestPopularCourses from "@/features/GuestHome/components/GuestPopularCourses";
import HeroSection from "@/features/GuestHome/components/HeroSection";
import { Loader } from "@/shared/components";
import CoursesSection from "@/shared/components/EduGap/CoursesSection";
import Experts from "@/shared/components/EduGap/Experts";
import Testimonials from "@/shared/components/EduGap/Testimonials";
import { useEffect, useState } from "react";

const GuestHome = () => {
  const { isLoading, setIsLoading } = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <>
      <HeroSection />
      <GuestPopularCourses />
      <CoursesSection />
      <Testimonials />
      <Experts />
    </>
  );
};

export default GuestHome;
