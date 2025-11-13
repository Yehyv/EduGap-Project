import LessonHeader from "@/features/ContentLesson/components/LessonHeader";
import { useLanguage } from "@/shared/localization/useLanguage";
import FavStarIcon from "@/assets/svgs/FavStarIcon.svg?react";
import { getSavedLessons } from "@/features/ContentLesson/services/lessonsApis";
import type { ContentTopicsTypeResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import CustomPagination from "@/shared/utils/CustomPagination";
import { useSearchParams } from "react-router-dom";
import { RESULTS_PER_PAGE } from "@/shared/utils/globals";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";
import SavedLessonsList from "@/features/CourseDetails/components/SavedLessonsList";
const SavedLessons = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("commentsPage")) || 1;

  const { data, isLoading, error } = useQuery<ContentTopicsTypeResponse>({
    queryKey: ["getSavedLesson", page],
    queryFn: () => getSavedLessons(page, RESULTS_PER_PAGE),
  });
  const handlePageChange = (newPage: number) => {
    setSearchParams({ commentsPage: newPage.toString() });
  };
  if (isLoading) return <Loader />;
  if (error)
    return (
      <ErrorMessage
        message={error?.message ?? "Error while fetching saved lessons"}
      />
    );
  return (
    <div className="container mb-20">
      <LessonHeader linkTo={-1} />
      <div className="container border border-[#9E9C9C] rounded-lg p-0 mt-5">
        <h4 className="border-b flex items-center gap-2 border-[#9E9C9C] p-5">
          <FavStarIcon />
          <span>{t("important_lessons")}</span>
        </h4>
        <div className="max-md:px-3 px-10 py-5 min-h-[70vh]">
          {data?.items?.map((d, i) => (
            <SavedLessonsList
              key={i}
              ContentTopics={{
                id: d?.topic?.id ?? 0,
                name: d?.topic?.name ?? "",
                lessons: d.lessons.map((lesson) => ({
                  ...lesson,
                  isUnlocked: true,
                })),
              }}
              indx={i + 1}
            />
          ))}
        </div>
        {data?.pagination?.total != undefined &&
          data?.pagination?.total > 1 && (
            <CustomPagination
              currentPage={data?.pagination?.page ?? 1}
              onPageChange={handlePageChange}
              totalPages={data?.pagination?.totalPages ?? 1}
            />
          )}
      </div>
    </div>
  );
};

export default SavedLessons;
