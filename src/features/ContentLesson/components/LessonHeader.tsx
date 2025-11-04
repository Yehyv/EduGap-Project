import { Suspense, lazy } from "react";
import { Link, useParams } from "react-router-dom";
const RightArrow = lazy(() => import("@/assets/svgs/RightArrow.svg?react"));
const TimeIcon = lazy(() => import("@/assets/svgs/TimeIcon.svg?react"));

type Props = {
  name: string;
  duration?: string;
  lang: string;
};

const LessonHeader = ({ name, duration = "—", lang }: Props) => {
  const { courseId } = useParams();
  return (
    <div className="flex max-md:flex-col max-md:gap-4 justify-between items-start pt-2 m-6 lg:mx-14">
      <div className="flex items-center gap-2">
        <div className="text-secondary">(104/72) 41%</div>
        <div className="w-[250px] max-md:w-[150px] h-1 bg-gray-300 rounded">
          <div
            className="h-1 bg-secondary rounded"
            style={{ width: "41%" }}
          ></div>
        </div>
      </div>

      <div>
        <Link
          to={`/user-course-details/${courseId}`}
          className="flex items-center gap-2"
        >
          <h4 className="m-0">{name}</h4>
          <Suspense fallback={null}>
            <RightArrow className={lang === "ar" ? "rotate-180" : ""} />
          </Suspense>
        </Link>

        <div className="flex gap-2 mt-2 text-sm">
          <Suspense fallback={null}>
            <TimeIcon className="w-4" />
          </Suspense>
          <div>{duration}</div>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
