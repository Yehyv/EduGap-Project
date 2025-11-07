import {
  getContentNameAndDuration,
  getContentProgressData,
} from "@/features/CourseDetails/services/contentDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import { formatDuration } from "@/shared/utils/globals";
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Link, useParams } from "react-router-dom";
const RightArrow = lazy(() => import("@/assets/svgs/RightArrow.svg?react"));
const TimeIcon = lazy(() => import("@/assets/svgs/TimeIcon.svg?react"));

const LessonHeader = () => {
  const { lang } = useLanguage();
  const { courseId } = useParams();

  const { data } = useQuery({
    queryKey: ["getContentNameAndDuration", courseId],
    queryFn: () => getContentNameAndDuration(courseId!),
  });
  const { data: contentProgressData } = useQuery({
    queryKey: ["getContentProgress", courseId],
    queryFn: () => getContentProgressData(courseId!),
  });
  console.log(contentProgressData?.percent);

  return (
    <div className="flex max-md:flex-col max-md:gap-4 justify-between items-start pt-2 my-1">
      <div className="flex items-center gap-2">
        <div className="text-secondary">
          ({contentProgressData?.totalLessons}/
          {contentProgressData?.completedLessons}){" "}
          {contentProgressData?.percent}%
        </div>
        <div className="w-[250px] max-md:w-[150px] h-1 bg-gray-300 rounded">
          <div
            className="h-1 bg-secondary rounded"
            style={{ width: `${contentProgressData?.percent}%` }}
          ></div>
        </div>
      </div>

      <div>
        <Link
          to={`/user-course-details/${courseId}`}
          className="flex items-center gap-2"
        >
          <h4 className="m-0">{data?.name}</h4>
          <Suspense fallback={null}>
            <RightArrow className={lang === "ar" ? "rotate-180" : ""} />
          </Suspense>
        </Link>

        <div className="flex gap-2 mt-2 text-sm">
          <Suspense fallback={null}>
            <TimeIcon className="w-4" />
          </Suspense>
          <div>{formatDuration(data?.totalDuration ?? 0, lang)}</div>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
