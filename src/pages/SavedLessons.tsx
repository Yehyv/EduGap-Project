import LessonHeader from "@/features/ContentLesson/components/LessonHeader";
import { useLanguage } from "@/shared/localization/useLanguage";
import FavStarIcon from "@/assets/svgs/FavStarIcon.svg?react";
import { getSavedLessons } from "@/features/ContentLesson/services/lessonsApis";
import type { ContentTopicsTypeResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import LessonsList from "@/features/CourseDetails/components/LessonsList";
const SavedLessons = () => {
  const { t, lang } = useLanguage();
  const { data, isLoading, error } = useQuery<ContentTopicsTypeResponse>({
    queryKey: ["getSavedLesson"],
    queryFn: () => getSavedLessons("1", "10"),
  });
  console.log(data);

  return (
    <div>
      <LessonHeader
        lang={lang}
        name={t("back_to_course_details")}
        duration="12 دقيقة"
      />
      <div className="container border border-[#9E9C9C] rounded-lg p-0 mt-5">
        <h4 className="border-b flex items-center gap-2 border-[#9E9C9C] p-5">
          <FavStarIcon />
          <span>الدروس الهامة</span>
        </h4>
        <div>
          {/* {data?.items?.map((d, i) => (
            <LessonsList
              key={i}
              ContentTopics={{
                lessons: {
                  d.lesson,
                  //   id: d?.content?.id,
                },
                duration: 1,
                name: "name",
                id: 2,
              }}
              indx={i + 1}
            />
          ))} */}
        </div>
      </div>
    </div>
  );
};

export default SavedLessons;
