import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import CourseCard from "@/shared/components/EduGap/CourseCard";
// import type { CourseTypes } from "@/shared/types/sharedTypes";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";
import type { CourseType } from "@/shared/types/sharedTypes";
import { useResponsiveSlides } from "@/shared/utils/useResponsiveSlides";
import { useLanguage } from "@/shared/localization/useLanguage";

const UserPopularCourses = () => {
  const { t } = useLanguage();
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
  const { slidesToShow, windowWidth } = useResponsiveSlides(
    [
      { width: 600, slides: 1 },
      { width: 1000, slides: 2 },
      { width: 1180, slides: 3 },
    ],
    4 // default
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    accessibility: true,
    nextArrow: windowWidth >= 1180 ? <ArrowButton direction="right" /> : <></>,
    prevArrow: windowWidth >= 1180 ? <ArrowButton direction="left" /> : <></>,
  };

  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("courses_title")} />
        <GhostButton buttonText={t("more")} to="" />
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
