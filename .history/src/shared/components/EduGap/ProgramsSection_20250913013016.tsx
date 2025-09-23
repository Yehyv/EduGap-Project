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

const ProgramsSection = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<ProgramsType[]>({
    queryKey: ["educationPrograms"],
    queryFn: getEducationProgramsForSlider,
  });
  const slidesToShow = useResponsiveSlides(
    [
      { width: 600, slides: 1 },
      { width: 1000, slides: 1 },
      { width: 1180, slides: 2 },
    ],
    2 // default
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

  if (error) return <SliderErrorFallback componentTitle={error?.message} />;

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("programs_title")} />
        <GhostButton buttonText={t("more")} to="/guest-programs" />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1  lg:grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <ProgramsSectionCardSkeleton key={idx} />
          ))}
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
