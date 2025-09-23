import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";
import type { CourseType } from "@/shared/types/sharedTypes";
import { useResponsiveSlides } from "@/shared/utils/useResponsiveSlides";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { getPopularCoursesForSlider } from "@/features/GuestHome/services/GuestHomeApi";

const UserPopularCourses = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<CourseType[]>({
    queryKey: ["userCoursesSlider"],
    queryFn: getPopularCoursesForSlider,
  });
  const { slidesToShow, windowWidth } = useResponsiveSlides(
    [
      { width: 600, slides: 1 },
      { width: 1000, slides: 2 },
      { width: 1180, slides: 3 },
    ],
    4 // default
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    accessibility: true,
    nextArrow: windowWidth >= 1180 ? <ArrowButton direction="right" /> : <></>,
    prevArrow: windowWidth >= 1180 ? <ArrowButton direction="left" /> : <></>,
  };

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("courses_title")} />
        <GhostButton buttonText={t("more")} to="/user-popular-courses" />
      </div>
      <Slider {...settings}>
        {data?.map((courseData, idx) => (
          <CourseCard key={idx} course={courseData} />
        ))}
      </Slider>
    </div>
  );
};

export default UserPopularCourses;
