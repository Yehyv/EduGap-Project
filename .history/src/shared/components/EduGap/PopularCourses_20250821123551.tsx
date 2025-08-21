import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import CourseCard from "./CourseCard";
const data: any = [{ image: "", name: "Abdullah", instructor: "Abdo" }];
const PopularCourses = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 4,
  };
  return (
    <div className="mb-5 container">
      <SectionTitle textTitle="الدورات الاكثر شيوعا" />
      {/* <Slider {...settings}>
        <div>
          <h3>1</h3>
        </div>
        <div>
          <h3>2</h3>
        </div>
        <div>
          <h3>3</h3>
        </div>
        <div>
          <h3>4</h3>
        </div>
        <div>
          <h3>5</h3>
        </div>
        <div>
          <h3>6</h3>
        </div>
      </Slider> */}
      {data?.map((course) => {
        <CourseCard course={course} />;
      })}
    </div>
  );
};

export default PopularCourses;
