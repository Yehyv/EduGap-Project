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

const Experts = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<ExpertsData[]>({
    queryKey: ["getExpertsForSlider"],
    queryFn: getExpertsForSlider,
  });
  const slidesToShow = useResponsiveSlides(
    [
      { width: 600, slides: 1 },
      { width: 1000, slides: 2 },
      { width: 1180, slides: 3 },
    ],
    5 // default
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    accessibility: true,
    nextArrow: slidesToShow > 1 ? <ArrowButton direction="right" /> : <></>,
    prevArrow: slidesToShow > 1 ? <ArrowButton direction="left" /> : <></>,
  };

  if (error) return <SliderErrorFallback componentTitle={t("experts")} />;
  return (
    <div className="container mb-20">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("experts")} lineWidth="w-22" />
        <GhostButton buttonText={t("more")} to="experts-list" />
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
