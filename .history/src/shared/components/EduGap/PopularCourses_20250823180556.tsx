import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import CourseCard from "./CourseCard";
import type { CourseTypes } from "@/shared/types/courses";
import ArrowButton from "../ui/ArrowButton";
import GhostButton from "../ui/GhostButton";

const PopularCourses = () => {
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
    slidesToShow: 4,
    slidesToScroll: 2,
    accessibility: true,
    nextArrow: <ArrowButton direction="right" />,
    prevArrow: <ArrowButton direction="left" />,
    responsive: [
      {
        breakpoint: 1180,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          dots: true,
          centerMode: true,
        },
      },

      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
          nextArrow: <></>,
          prevArrow: <></>,
          centerMode: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          nextArrow: <></>,
          prevArrow: <></>,
          centerMode: true,
        },
      },
    ],
  };

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle="الدورات الاكثر شيوعا" />
        <GhostButton buttonText="المزيد" to="" />
      </div>
      <Slider {...settings}>
        {data?.map((courseData, idx) => (
          <CourseCard key={idx} course={courseData} />
        ))}
      </Slider>
    </div>
  );
};

export default PopularCourses;
