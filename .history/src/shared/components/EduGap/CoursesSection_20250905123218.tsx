import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import type { CourseTypes } from "@/shared/types/sharedTypes";
import ArrowButton from "../ui/ArrowButton";
import CoursesSectionCard from "./CoursesSectionCard";
import GhostButton from "../ui/GhostButton";

const CoursesSection = () => {
  // fake data
  const data: CourseTypes[] = [
    {
      id: 1,
      category: "تجارة",
      title: "تعلم اللغة الإنجليزية من الصفر للاحترافية",
      instructor: "د/ محمد سعيد - دكتور جامعي",
      rating: 4.8,
      reviews: 2145,
      level: "عالي المستوي",
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
    slidesToShow: 2, // الافتراضي: 2
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

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle="البرامج التعليمية" />
        <GhostButton buttonText="المزيد" to="" />
      </div>
      <Slider {...settings}>
        {data?.map((courseData, index) => (
          <CoursesSectionCard key={index} course={courseData} />
        ))}
      </Slider>
    </div>
  );
};

export default CoursesSection;
