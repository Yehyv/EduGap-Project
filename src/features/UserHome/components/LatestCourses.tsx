import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import type { CourseType } from "@/shared/types/sharedTypes";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";
import { useQuery } from "@tanstack/react-query";
import { getLatestCoursesForSlider } from "@/features/GuestHome/services/GuestHomeApi";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useResponsiveSlides } from "@/shared/utils/useResponsiveSlides";
import { useUser } from "@/features/auth/context/UserContext";

const LatestCourses = () => {
  const { t } = useLanguage();
  const { user } = useUser();

  const { data, isLoading, error } = useQuery<CourseType[]>({
    queryKey: ["latestCoursesSlider", user?.programId],
    queryFn: () => getLatestCoursesForSlider(user!.programId),
    // enabled: !!user?.programId,
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
    dots: windowWidth <= 1180,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    accessibility: true,
    nextArrow: windowWidth >= 1180 ? <ArrowButton direction="right" /> : <></>,
    prevArrow: windowWidth >= 1180 ? <ArrowButton direction="left" /> : <></>,
  };

  if (error) return <SliderErrorFallback componentTitle={t("courses_title")} />;

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("training_courses")} />
        <GhostButton buttonText={t("more")} to="/latest-courses" />
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
                <CourseCard key={idx} course={courseData} />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default LatestCourses;
