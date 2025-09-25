import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import type { CourseType } from "@/shared/types/sharedTypes";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";
import { useQuery } from "@tanstack/react-query";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useResponsiveSlides } from "@/shared/utils/useResponsiveSlides";
import InstituteCourseCard from "./InstituteCourseCard";
import { getInstituteCoursesForSlider } from "../services/userHomeApis";
const InstituteCoursesSection = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<CourseType[]>({
    queryKey: ["InstituteCoursesSection"],
    queryFn: getInstituteCoursesForSlider,
  });

  const { slidesToShow, windowWidth } = useResponsiveSlides(
    [
      { width: 600, slides: 1 },
      { width: 1000, slides: 2 },
      { width: 1180, slides: 3 },
    ],
    3 // default
  );

  console.log(data);

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

  if (error)
    return (
      <SliderErrorFallback componentTitle={t("institute_courses_title")} />
    );

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("institute_courses_title")} />
        <GhostButton buttonText={t("more")} to="/popular-courses-list" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="w-full py-5">
          <Slider {...settings}>
            {data?.map((courseData, idx) => (
              <div key={idx} className="px-2">
                <InstituteCourseCard key={idx} course={courseData} />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default InstituteCoursesSection;
