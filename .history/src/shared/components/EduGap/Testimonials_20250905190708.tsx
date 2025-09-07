import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import type { TestimonialsTypes } from "@/shared/types/sharedTypes";
import ArrowButton from "../ui/ArrowButton";
import TestimonialsCard from "./TestimonialsCard";
import IconsGroup from "@/assets/svgs/iconsGroup.svg?react";
const Testimonials = () => {
  const data: TestimonialsTypes[] = [
    {
      id: 1,
      name: "عبدالله",
      description: "تعلم اللغة الإنجليزية من الصفر للاحترافية",
      image: "",
    },
    {
      id: 2,
      category: "برمجة",
      title: "React من البداية حتى الاحتراف",
      instructor: "د/ عبدالله الشعلان",
      rating: 4.7,
      reviews: 1980,
      level: "متوسط",
      image: "",
    },
    {
      id: 3,
      category: "تصميم",
      title: "Mastering Figma للمصممين المبتدئين",
      instructor: "د/ ليلى حسام",
      rating: 4.9,
      reviews: 2540,
      level: "عالي المستوي",
      image: "",
    },
    {
      id: 4,
      category: "تسويق",
      title: "Digital Marketing Strategy 2025",
      instructor: "د/ عمر سامي",
      rating: 4.6,
      reviews: 1780,
      level: "مبتدئ",
      image: "",
    },
    {
      id: 5,
      category: "تسويق",
      title: "Digital Marketing Strategy 2025",
      instructor: "د/ عمر سامي",
      rating: 4.6,
      reviews: 1780,
      level: "مبتدئ",
      image: "",
    },
    {
      id: 6,
      category: "تسويق",
      title: "Digital Marketing Strategy 2025",
      instructor: "د/ عمر سامي",
      rating: 4.6,
      reviews: 1780,
      level: "مبتدئ",
      image: "",
    },
  ];
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
    <div className=" bg-testimonial-color py-5">
      <div className="container relative py-10">
        <SectionTitle textTitle="اراء عملائنا" lineWidth="w-28" />
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />
        <Slider {...settings}>
          {data?.map((Testimonials, index) => (
            <TestimonialsCard key={index} Testimonials={Testimonials} />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Testimonials;
