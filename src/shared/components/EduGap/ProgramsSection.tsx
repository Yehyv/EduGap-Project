import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import ArrowButton from "../ui/ArrowButton";
import ProgramsSectionCard from "./ProgramsSectionCard";
import GhostButton from "../ui/GhostButton";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery } from "@tanstack/react-query";
import type { ProgramsType } from "@/shared/types/sharedTypes";
import { getEducationProgramsForSlider } from "@/features/GuestHome/services/GuestHomeApi";
import ProgramsSectionCardSkeleton from "../ui/ProgramsSectionCardSkeleton";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import { useResponsiveSlides } from "@/shared/utils/useResponsiveSlides";
import { useState } from "react";

const ProgramsSection = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<ProgramsType[]>({
    queryKey: ["educationProgramsForSlider"],
    queryFn: getEducationProgramsForSlider,
  });

  const { slidesToShow, windowWidth } = useResponsiveSlides(
    [
      { width: 600, slides: 1 },
      { width: 1000, slides: 1 },
      { width: 1180, slides: 2 },
    ],
    2 // default
  );

  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = data?.length ?? 0;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide >= totalSlides - slidesToShow;

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow,
    slidesToScroll: windowWidth >= 1180 ? 3 : 1,
    accessibility: true,

    // track slide index
    beforeChange: (_: number, next: number) => setCurrentSlide(next),

    nextArrow:
      windowWidth >= 1180 ? (
        <ArrowButton direction="right" disabled={isLastSlide} />
      ) : (
        <></>
      ),

    prevArrow:
      windowWidth >= 1180 ? (
        <ArrowButton direction="left" disabled={isFirstSlide} />
      ) : (
        <></>
      ),
  };

  if (error) return <SliderErrorFallback componentTitle={error?.message} />;

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("programs_title")} />
        <GhostButton buttonText={t("more")} to="/programs-list" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <ProgramsSectionCardSkeleton key={idx} />
          ))}
        </div>
      ) : data?.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-500 text-lg font-medium">
            {t("no_data_available") ?? "لا يوجد بيانات متاحة"}
          </p>
        </div>
      ) : (
        <Slider {...settings}>
          {data?.map((d, index) => (
            <ProgramsSectionCard key={index} data={d} />
          ))}
        </Slider>
      )}
    </div>
  );
};

export default ProgramsSection;
