import { Suspense, lazy } from "react";
import AddNotesInLesson from "@/features/CourseDetails/components/AddNotesInLesson";
import { useLanguage } from "@/shared/localization/useLanguage";
import { getMyNotesInLesson } from "../services/lessonsApis";
import { useParams, useSearchParams } from "react-router-dom";
import type { MyNotesInLessonTypeResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import CustomPagination from "@/shared/utils/CustomPagination";

const TitleLine = lazy(() => import("@/assets/svgs/TitileLine.svg?react"));
const EditIcon = lazy(() => import("@/assets/svgs/EditTextIcon.svg?react"));
const TrashIcon = lazy(() => import("@/assets/svgs/TrashIcon.svg?react"));

const LessonNotes = () => {
  const { t } = useLanguage();
  const { lessonId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, error } = useQuery<MyNotesInLessonTypeResponse>({
    queryKey: ["getMyNotesInLesson", page, lessonId],
    queryFn: () => getMyNotesInLesson(page, lessonId!),
    enabled: !!lessonId,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (isLoading) return <CircleLoader />;
  if (error) return <div>{t("error_fetching_notes")}</div>;

  const notesList = data?.items || [];

  return (
    <div className="min-h-[350px]">
      <div className="mb-5">
        <h4 className="mb-0">{t("notes")}</h4>
        <Suspense fallback={<div className="h-1 bg-gray-200 w-24 rounded" />}>
          <TitleLine className="w-22" />
        </Suspense>
      </div>

      <AddNotesInLesson />

      {/* Notes List */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-10 mt-10">
        {notesList.length > 0 ? (
          notesList.map((noteItem, i) => (
            <div
              key={noteItem.id}
              className="w-full transition hover:shadow-md"
            >
              <h5 className="text-[#EF9F00] mb-2">
                {t("note")} {i + 1}
              </h5>

              <div className="relative bg-[#F3FEFF] min-h-[200px] rounded-xl border border-[#9E9C9C] p-3">
                <span>{noteItem.notes}</span>

                {/* Actions */}
                <div className="flex items-center gap-2 absolute bottom-2 end-2">
                  <EditIcon className="cursor-pointer hover:scale-110 transition" />
                  <TrashIcon className="cursor-pointer hover:scale-110 transition" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 bg-gray-100 p-4 rounded-lg w-full">
            {t("no_notes_available")}
          </div>
        )}
      </div>
      <CustomPagination
        currentPage={data?.pagination?.page ?? 1}
        onPageChange={handlePageChange}
        totalPages={data?.pagination?.totalPages ?? 1}
      />
    </div>
  );
};

export default LessonNotes;
