import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";
import { useQuery } from "@tanstack/react-query";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useResponsiveSlides } from "@/shared/utils/useResponsiveSlides";
import InstituteCourseCard from "./InstituteCourseCard";
import { getInstituteCoursesForSlider } from "../services/userHomeApis";
import { useUser } from "@/features/auth/context/UserContext";
import type { InstituteCoursesType } from "@/shared/types/sharedTypes";
const InstituteCoursesSection = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const { data, isLoading, error } = useQuery<InstituteCoursesType[]>({
    queryKey: ["InstituteCoursesSection", user?.programId],
    queryFn: () => getInstituteCoursesForSlider(user?.programId),
    enabled: !!user?.programId,
  });

  const { slidesToShow, windowWidth } = useResponsiveSlides(
    [
      { width: 600, slides: 1 },
      { width: 1000, slides: 2 },
      { width: 1180, slides: 3 },
    ],
    3
  );
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    accessibility: true,
    lazyLoad: "ondemand",
    waitForAnimate: false,
    adaptiveHeight: true,
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
        <SectionTitle
          textTitle={`${t("institute_courses_title")} ${user?.instituteName}`}
        />
        <GhostButton buttonText={t("more")} to="/institute-courses" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="w-full py-5 min-h-[300px]">
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
