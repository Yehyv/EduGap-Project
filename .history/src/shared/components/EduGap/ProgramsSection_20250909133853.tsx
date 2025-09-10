import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import ArrowButton from "../ui/ArrowButton";
import CoursesSectionCard from "./CoursesSectionCard";
import GhostButton from "../ui/GhostButton";
import { useLanguage } from "@/shared/localization/useLanguage";
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
const CoursesSection = () => {
  const { t } = useLanguage();
  return (
    <div className="mb-5 container">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle={t("programs_title")} />
        <GhostButton buttonText={t("more")} to="" />
      </div>
      <Slider {...settings}>
        {[1, 2, 3, 4, 5, 6]?.map((_, index) => (
          <CoursesSectionCard key={index} />
        ))}
      </Slider>
    </div>
  );
};

export default CoursesSection;
