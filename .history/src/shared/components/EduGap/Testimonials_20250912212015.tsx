import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import type { TestimonialsTypes } from "@/shared/types/sharedTypes";
import ArrowButton from "../ui/ArrowButton";
import TestimonialsCard from "./TestimonialsCard";
import IconsGroup from "@/assets/svgs/iconsGroup.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Testimonials = () => {
  const { t } = useLanguage();
  const data: TestimonialsTypes[] = [
    {
      id: 1,
      name: "عبدالله",
      description: "تعلم اللغة الإنجليزية من الصفر للاحترافية",
      image: "",
    },
    {
      id: 2,
      name: "عبدالله",
      description: "تعلم اللغة الإنجليزية من الصفر للاحترافية",
      image: "",
    },
    {
      id: 3,
      name: "عبدالله",
      description: "تعلم اللغة الإنجليزية من الصفر للاحترافية",
      image: "",
    },
    {
      id: 4,
      name: "عبدالله",
      description: "تعلم اللغة الإنجليزية من الصفر للاحترافية",
      image: "",
    },
    {
      id: 5,
      name: "عبدالله",
      description: "تعلم اللغة الإنجليزية من الصفر للاحترافية",
      image: "",
    },
    {
      id: 6,
      name: "عبدالله",
      description: "تعلم اللغة الإنجليزية من الصفر للاحترافية",
      image: "",
    },
  ];
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    nextArrow: <ArrowButton bgColor="#Ffffff" direction="right" />,
    prevArrow: <ArrowButton bgColor="white" direction="left" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
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
    <div className=" bg-testimonial-color py-5">
      <div className="container relative py-10">
        <SectionTitle textTitle={t("testimonials_title")} lineWidth="w-28" />
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />
        <div className="w-full px-2">
          <Slider {...settings}>
            {data?.map((Testimonials, index) => (
              <TestimonialsCard key={index} Testimonials={Testimonials} />
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
