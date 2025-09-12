import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import CourseCard from "@/shared/components/EduGap/CourseCard";
// import type { CourseTypes } from "@/shared/types/sharedTypes";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";
import type { CourseType } from "@/shared/types/sharedTypes";

const UserPopularCourses = () => {
  // fake data
  const data: CourseType[] = [
    {
      id: 1,
      image: "content1.png",
      rate: 0,
      // lessonsCount: 5,
      levelName: "Beginner",
      whatToLearn: [],
      name: "Programming Basics1",
      description: "Learn the fundamentals of programming1.",
      durationTime: "2 hours 50 minute / 12 lesson",
      educators: [
        {
          id: 1,
          title: "Prof Nestjs",
          bio: "best upcomming nestjs developer ever",
          image: "image.png",
          firstName: "edu",
          lastName: "gap",
        },
      ],
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

export default UserPopularCourses;
