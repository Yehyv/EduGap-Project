import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import type { CourseType } from "@/shared/types/sharedTypes";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";
import { useQuery } from "@tanstack/react-query";
import { getGuestPopularCourses } from "../services/GuestHomeApi";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import { useLanguage } from "@/shared/localization/useLanguage";

const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 2,
  accessibility: true,
  nextArrow: <ArrowButton direction="right" />,
  prevArrow: <ArrowButton direction="left" />,
  // responsive: [
  //   {
  //     breakpoint: 1180,
  //     settings: {
  //       slidesToShow: 3,
  //       slidesToScroll: 1,
  //       dots: true,
  //       centerMode: true,
  //     },
  //   },

  //   {
  //     breakpoint: 1000,
  //     settings: {
  //       slidesToShow: 2,
  //       slidesToScroll: 1,
  //       dots: true,
  //       nextArrow: <></>,
  //       prevArrow: <></>,
  //       centerMode: true,
  //     },
  //   },
  //   {
  //     breakpoint: 600,
  //     settings: {
  //       slidesToShow: 1,
  //       slidesToScroll: 1,
  //       dots: true,
  //       nextArrow: <></>,
  //       prevArrow: <></>,
  //       centerMode: true,
  //     },
  //   },
  // ],
};
const GuestPopularCourses = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<CourseType[]>({
    queryKey: ["courses"],
    queryFn: getGuestPopularCourses,
  });

  if (error) return <SliderErrorFallback componentTitle={t("courses_title")} />;

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("courses_title")} />
        <GhostButton buttonText={t("more")} to="/guest-popular-courses" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="w-full">
          <Slider {...settings}>
            {data?.map((courseData, idx) => (
              <CourseCard key={idx} course={courseData} />
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default GuestPopularCourses;
