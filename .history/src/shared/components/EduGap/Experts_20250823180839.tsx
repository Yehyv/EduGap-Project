import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import type { CourseTypes } from "@/shared/types/courses";
import ArrowButton from "../ui/ArrowButton";
import TestimonialsCard from "./TestimonialsCard";
import IconsGroup from "@/assets/svgs/iconsGroup.svg?react";
const Experts = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <ArrowButton bgColor="#Ffffff" direction="right" />,
    prevArrow: <ArrowButton bgColor="white" direction="left" />,
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

  return (
    <div className="mb-5 bg-testimonial-color py-5">
      <div className="container relative py-5">
        <SectionTitle textTitle="اراء عملائنا" lineWidth="w-28" />
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />
        <Slider {...settings}>
          {data?.map((expertsData, index) => (
            <TestimonialsCard key={index} experts={expertsData} />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Experts;
