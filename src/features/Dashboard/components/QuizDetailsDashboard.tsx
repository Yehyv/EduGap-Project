import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { Link, useParams } from "react-router-dom";
import PencilIcon from "@/assets/svgs/PencilIcon.svg?react";
import AddIcon from "@/assets/svgs/PlusBlueIcon.svg?react";
import DragIcon from "@/assets/svgs/DragIcon.svg?react";
import { useQuery } from "@tanstack/react-query";
import {
  getLessonDetailsForDashboard,
  getQuizQuestions,
} from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import ErrorMessage from "@/shared/components/ErrorMessage";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import { LESSON_TYPES } from "@/shared/utils/globals";
import ShowQuizQuestions from "./ShowQuizQuestions";
import { useState } from "react";
import AddNewQuestion from "./AddNewQuestion";

const QuizDetailsDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);
  const { lessonId, topicId, contentId } = useParams();
  const { t } = useLanguage();

  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["quizDetailsForDashboard", lessonId],
    queryFn: () => getLessonDetailsForDashboard(lessonId ?? "", topicId ?? ""),
    enabled: !!lessonId,
  });
  const {
    data: quizQuestions,
    isLoading: quizQuestionsLoading,
    isError: quizQuestionsIsError,
    error: quizQuestionsError,
  } = useQuery({
    queryKey: ["quizQuestions", lessonId],
    queryFn: () => getQuizQuestions(lessonId ?? ""),
    enabled: !!lessonId,
  });

  const lesson = data?.data;
  const isActive = Boolean(lesson?.is_active);

  if (isLoading) {
    return <CircleLoader />;
  }

  if (isError)
    return (
      <ErrorMessage
        message={error?.message ?? "Error While Fetching Expert Data"}
      />
    );

  return (
    <>
      {/* ================= Lesson ================= */}
      <DashboardPageTitle
        text={"Quiz Details"}
        button
        moreStyle="!from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5"
        buttonText={
          <Link
            to={`/dashboard/contents/${contentId}/topic/${topicId}/edit-lesson/${lessonId}`}
            className="center"
          >
            <PencilIcon className="h-8 mx-2" />
            <span className="inline-block me-4 text-secondary">
              Edit Quiz Data
            </span>
          </Link>
        }
      />

      <div className="bg-white rounded-lg p-5 mt-3">
        <div className="flex justify-between border-b pb-2 mb-4 border-[#ACACAC]">
          <h5 className="text-secondary font-bold">Quiz Data</h5>

          <button
            className={`px-6 py-1 rounded-full border font-medium text-sm relative ${
              isActive
                ? "border-green-500 text-green-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {isActive ? t("active") : t("inactive")}
            <span
              className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="text-[#444444] text-sm">Quiz Name</h6>
            <p>{lesson?.translations[0].name || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">Description</h6>
            <p>{lesson?.translations[0].description || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">Link</h6>
            <p>{lesson?.video_link || "-"}</p>
          </div>
          <div>
            <h6 className="text-[#444444] text-sm">Type</h6>
            <p>
              {lesson?.lesson_type == LESSON_TYPES.LESSON ? "Lesson" : "Quiz"}
            </p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("created_at")}</h6>
            <p>{lesson?.created_at || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">{t("created_by")}</h6>
            <p>{lesson?.created_by || "-"}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-5 mt-3">
        <div className="flex justify-between border-b pb-2 mb-4 border-[#ACACAC]">
          <h5 className="text-secondary font-bold">Quiz Data In English</h5>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h6 className="text-[#444444] text-sm">Quiz Name</h6>
            <p>{lesson?.translations[1]?.name || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">Description</h6>
            <p>{lesson?.translations[1]?.description || "-"}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-10">
        <h4>Questions</h4>
        <button
          onClick={() => setModalOpen(true)}
          className="center border border-secondary rounded-2xl py-1 "
        >
          <AddIcon className="h-6 mx-1" />
          <span className="inline-block me-4 text-secondary">
            Add New Questions
          </span>
        </button>
      </div>

      {quizQuestionsLoading ? (
        <CircleLoader />
      ) : (
        <div className="bg-white rounded-lg p-5 mt-3">
          <div className="flex justify-between border-b pb-2 mb-4 border-[#ACACAC]">
            <h5 className="text-secondary font-bold">Quiz Questions</h5>
          </div>

          {quizQuestionsIsError && (
            <ErrorMessage
              message={
                quizQuestionsError.message ??
                "Error while fetching quiz question"
              }
            />
          )}

          <div className="flex flex-col gap-3">
            {quizQuestions?.data?.questions?.map((q, index) => (
              <div className="border border-[#ACACAC] rounded-md p-3">
                <div className="flex gap-3 items-center">
                  <DragIcon />
                  <h6 className="text-[#757474]">Question Num {index + 1}</h6>
                  <div className="bg-[#E9F7FF] text-sm rounded-2xl px-2">
                    {q.answers.length > 2 ? "MCQs" : "T/F"}
                  </div>
                  <div className="bg-[#F1F1F1] text-sm rounded-2xl px-2">
                    One Point
                  </div>
                </div>
                <p className="text-lg mx-4 md:mx-7 my-2">{q?.title}</p>
                <ul className="ps-2">
                  {q.answers.map((a) => (
                    <li>
                      <span>{a.label}</span> {")"} <span>{a.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <ShowQuizQuestions
        questionsData={quizQuestions}
        lessonName={lesson?.translations[0]?.name ?? ""}
        reviewModalOpen={modalOpen}
        setReviewModalOpen={setModalOpen}
        setOpenAddQuestionModal={setAddQuestionModalOpen}
      />
      <AddNewQuestion
        reviewModalOpen={addQuestionModalOpen}
        setReviewModalOpen={setAddQuestionModalOpen}
        setShowQuestionsModalOpen={setModalOpen}
      />
    </>
  );
};

export default QuizDetailsDashboard;
