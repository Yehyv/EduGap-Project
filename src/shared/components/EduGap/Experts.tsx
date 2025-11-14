import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import ArrowButton from "../ui/ArrowButton";
import GhostButton from "../ui/GhostButton";
import ExpertsCard from "./ExpertsCard";
import { useQuery } from "@tanstack/react-query";
import { getExpertsForSlider } from "@/shared/services/sharedApis";
import type { ExpertsData } from "@/shared/types/sharedTypes";
import ExpertSkeleton from "../ui/ExpertSkeleton";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useResponsiveSlides } from "@/shared/utils/useResponsiveSlides";
import { useState } from "react";

const Experts = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<ExpertsData[]>({
    queryKey: ["getExpertsForSlider"],
    queryFn: getExpertsForSlider,
  });
  const { slidesToShow, windowWidth } = useResponsiveSlides(
    [
      { width: 600, slides: 1 },
      { width: 1000, slides: 2 },
      { width: 1180, slides: 3 },
    ],
    5 // default
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

  if (error) return <SliderErrorFallback componentTitle={t("experts")} />;
  return (
    <div className="container mb-20">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("experts")} lineWidth="w-22" />
        <GhostButton buttonText={t("more")} to="/experts-list" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 justify-items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <ExpertSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Slider {...settings}>
          {data?.map((expertData, index) => (
            <ExpertsCard key={index} expertData={expertData} />
          ))}
        </Slider>
      )}
    </div>
  );
};

export default Experts;
