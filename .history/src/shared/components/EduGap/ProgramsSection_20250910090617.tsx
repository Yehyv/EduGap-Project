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
const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 1,
  nextArrow: <ArrowButton direction="right" />,
  prevArrow: <ArrowButton direction="left" />,
  responsive: [
    {
      breakpoint: 1124,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 1000,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        dots: true,
        nextArrow: <></>,
        prevArrow: <></>,
      },
    },
    {
      breakpoint: 480,
      settings: {
        dots: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <></>,
        prevArrow: <></>,
      },
    },
  ],
};
const ProgramsSection = () => {
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<ProgramsType[]>({
    queryKey: ["educationPrograms"],
    queryFn: getEducationProgramsForSlider,
  });

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("programs_title")} />
        <GhostButton buttonText={t("more")} to="" />
      </div>
      <div className="grid grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <ProgramsSectionCardSkeleton />
        ))}
      </div>
      <Slider {...settings}>
        {data?.map((d, index) => (
          <ProgramsSectionCard key={index} data={d} />
        ))}
      </Slider>
    </div>
  );
};

export default ProgramsSection;
