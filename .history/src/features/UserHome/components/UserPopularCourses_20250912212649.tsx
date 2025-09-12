import SectionTitle from "@/shared/components/SectionTitle";
import Slider from "react-slick";
import CourseCard from "@/shared/components/EduGap/CourseCard";
// import type { CourseTypes } from "@/shared/types/sharedTypes";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import GhostButton from "@/shared/components/ui/GhostButton";

const UserPopularCourses = () => {
  // fake data
  // const data: CourseTypes[] = [
  //   {
  //     id: 1,
  //     category: "تجارة",
  //     instructor: "د/ محمد سعيد - دكتور جامعي",
  //   },
  //   {
  //     id: 2,
  //     category: "برمجة",
  //     instructor: "د/ عبدالله الشعلان",
  //     rating: 4.7,
  //     reviews: 1980,
  //     level: "متوسط",
  //     image: "",
  //   },
  //   {
  //     id: 3,
  //     category: "تصميم",
  //     instructor: "د/ ليلى حسام",
  //     rating: 4.9,
  //     reviews: 2540,
  //     level: "عالي المستوي",
  //     image: "",
  //   },
  //   {
  //     id: 4,
  //     category: "تسويق",
  //     instructor: "د/ عمر سامي",
  //     rating: 4.6,
  //     reviews: 1780,
  //     level: "مبتدئ",
  //     image: "",
  //   },
  //   {
  //     id: 5,
  //     category: "تسويق",
  //     instructor: "د/ عمر سامي",
  //     rating: 4.6,
  //     reviews: 1780,
  //     level: "مبتدئ",
  //     image: "",
  //   },
  //   {
  //     id: 6,
  //     category: "تسويق",
  //     instructor: "د/ عمر سامي",
  //     rating: 4.6,
  //     reviews: 1780,
  //     level: "مبتدئ",
  //     image: "",
  //   },
  // ];
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
        {[
          {
            id: 1,
            image: "content1.png",
            rate: 0,
            lessonsCount: 5,
            levelName: "Beginner",
            whatToLearn: ["A", "B", "C"],
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
        ]?.map((courseData, idx) => (
          <CourseCard key={idx} course={courseData} />
        ))}
      </Slider>
    </div>
  );
};

export default UserPopularCourses;
