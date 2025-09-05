import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import type { CourseTypes } from "@/shared/types/sharedTypes";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";
import { useQuery } from "@tanstack/react-query";
import { getGuestPopularCourses } from "../services/GuestHomeApi";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";

const GuestPopularCourses = () => {
  const { data, isLoading, error } = useQuery<CourseTypes[]>({
    queryKey: ["courses"],
    queryFn: getGuestPopularCourses,
  });

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    accessibility: true,
    nextArrow: <ArrowButton direction="right" />,
    prevArrow: <ArrowButton direction="left" />,
    responsive: [
      {
        breakpoint: 1180,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          dots: true,
          centerMode: true,
        },
      },

      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
          nextArrow: <></>,
          prevArrow: <></>,
          centerMode: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          nextArrow: <></>,
          prevArrow: <></>,
          centerMode: true,
        },
      },
    ],
  };

  if (error)
    return <SliderErrorFallback componentTitle=" الدورات الاكثر شيوعا" />;

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle="الدورات الاكثر شيوعا" />
        <GhostButton buttonText="المزيد" to="/guest-popular-courses" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Slider {...settings}>
          {data?.map((courseData, idx) => (
            <CourseCard key={idx} course={courseData} />
          ))}
        </Slider>
      )}
    </div>
  );
};

export default GuestPopularCourses;
