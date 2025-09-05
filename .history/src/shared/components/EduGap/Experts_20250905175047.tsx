import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import ArrowButton from "../ui/ArrowButton";
import GhostButton from "../ui/GhostButton";
import ExpertsCard from "./ExpertsCard";
import { useQuery } from "@tanstack/react-query";
import { getExpertsForSlider } from "@/shared/services/sharedApis";
import type { ExpertsData } from "@/shared/types/sharedTypes";
import ExpertSkeleton from "../ui/ExpertSkeleton";
const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 5,
  slidesToScroll: 1,
  nextArrow: <ArrowButton direction="right" />,
  prevArrow: <ArrowButton direction="left" />,
  responsive: [
    {
      breakpoint: 1124,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 1000,
      settings: {
        slidesToShow: 2,
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
const Experts = () => {
  const { data, isLoading, error } = useQuery<ExpertsData[]>({
    queryKey: ["getExpertsForSlider"],
    queryFn: getExpertsForSlider,
  });
  return (
    <div className="container mb-20">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle="الخبراء" lineWidth="w-22" />
        <GhostButton buttonText="المزيد" to="" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ExpertSkeleton key={i} />
        ))}
      </div>
      <Slider {...settings}>
        {data?.map((expertData, index) => (
          <ExpertsCard key={index} expertData={expertData} />
        ))}
      </Slider>
    </div>
  );
};

export default Experts;
