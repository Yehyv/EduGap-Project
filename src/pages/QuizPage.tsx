import { useQuery } from "@tanstack/react-query";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CourseContentCard from "@/features/CourseDetails/components/CourseContentCard";
import { getContentTopicsForUser } from "@/features/CourseDetails/services/contentDetails";
import LessonHeader from "@/features/ContentLesson/components/LessonHeader";
import type { ContentTopicsType } from "@/shared/types/sharedTypes";
import LessonQuestions from "@/features/Quiz/components/LessonQuestions";
import { useParams } from "react-router-dom";
import { getQuizDetails } from "@/features/Quiz/services/quizApis";

const QuizPage = () => {
  const { lessonId, courseId } = useParams();

  const {
    data: getContentTopicsAndLessons,
    isLoading,
    error,
  } = useQuery<ContentTopicsType[]>({
    queryKey: ["getTopicsInContentForUser", courseId],
    queryFn: () => getContentTopicsForUser(courseId!),
    enabled: !!courseId,
  });

  const { data } = useQuery({
    queryKey: ["quizDetails", lessonId],
    queryFn: () => getQuizDetails(lessonId!),
  });

  return (
    <div className="flex flex-col h-full">
      <ScrollToTop />

      <div className="container">
        <LessonHeader linkTo={`/user-course-details/${courseId}`} />
        <div className="flex h-full justify-start flex-col gap-6 lg:flex-row">
          <CourseContentCard
            data={getContentTopicsAndLessons ?? []}
            isLoading={isLoading}
            error={error}
          />
          <div className="w-full lg:w-[80%] mb-10">
            {data && <LessonQuestions data={data} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
