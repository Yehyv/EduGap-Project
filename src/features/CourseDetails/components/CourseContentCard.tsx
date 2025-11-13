import { lazy, Suspense } from "react";
import { useLanguage } from "@/shared/localization/useLanguage";
import ComputerIcon from "@/assets/svgs/ComputerIcon.svg?react";
import LessonRate from "@/features/ContentLesson/components/LessonRate";
import LessonExpert from "@/features/ContentLesson/components/LessonExpert";
import LessonsQuickLinks from "@/features/ContentLesson/components/LessonsQuickLinks";
import type { ContentTopicsType } from "@/shared/types/sharedTypes";

// Lazy load
const LessonsList = lazy(() => import("./LessonsList"));

const CourseContentCard = ({
  data,
  isLoading,
  error,
}: {
  data: ContentTopicsType[];
  isLoading: boolean;
  error: object | null;
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full lg:w-[30%] h-full mb-10">
      {/* Lessons List */}
      <div className="shadow-custom rounded-xl py-5 min-lg:h-[400px]">
        <h5 className="flex gap-2 text-lg font-semibold mb-4 border-b pb-3 border-[#D0CDCD] px-5 sticky top-0 bg-white z-10">
          <ComputerIcon />
          <span>{t("course_content")}</span>
        </h5>

        <div className="overflow-y-auto overflow-x-hidden mx-1 pe-3 ms-2 my-2 space-y-2 max-h-[300px]">
          {isLoading && (
            <div className="text-center py-4 text-gray-500">
              {t("loading_content")}...
            </div>
          )}

          {!isLoading && error && (
            <div className="text-red-500 bg-red-50 rounded-md p-3 text-center text-sm">
              {t("failed_to_load_content")}
            </div>
          )}

          {!isLoading && !error && data?.length === 0 && (
            <div className="text-gray-500 text-center bg-gray-100 rounded-md p-3 text-sm">
              {t("no_lessons_available")}
            </div>
          )}

          {!isLoading && !error && (
            <Suspense
              fallback={
                <div className="text-center text-gray-500">
                  {t("loading")}...
                </div>
              }
            >
              {data?.map((d, i) => (
                <LessonsList key={i} ContentTopics={d} indx={i + 1} />
              ))}
            </Suspense>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <LessonsQuickLinks />

      {/* Expert */}
      <LessonExpert />

      {/* Rate Lesson */}
      <LessonRate />
    </div>
  );
};

export default CourseContentCard;
