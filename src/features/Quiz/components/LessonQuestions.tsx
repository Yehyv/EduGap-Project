import { motion } from "framer-motion";
import TitleLine from "@/assets/svgs/TitileLine.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { QuizDetailsType } from "@/features/Quiz/types/quizTypes";
import QuizQuestion from "./QuizQuestion";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { submitQuizAnswers } from "../services/quizApis";
import { useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const LessonQuestions = ({ data }: { data: QuizDetailsType }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { courseId } = useParams();
  const [result, setResult] = useState<null | {
    scorePercent: number;
    passPercent: number;
    isPassed: boolean;
    questions: {
      questionId: number;
      correctLabel: string;
      studentLabel: string;
      isCorrect: boolean;
    }[];
  }>(null);

  const localStorageKey = `quiz-answers-lesson-${data.lessonId}`;

  useEffect(() => {
    const page = searchParams.get("page");
    if (page) setCurrentIndex(Number(page) - 1);
  }, []);

  useEffect(() => {
    setSearchParams({ page: (currentIndex + 1).toString() });
  }, [currentIndex]);

  useEffect(() => {
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      try {
        setAnswers(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored answers", e);
      }
    }
  }, [localStorageKey]);

  const handleSelectAnswer = (questionId: number, answerLabel: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: answerLabel };
      localStorage.setItem(localStorageKey, JSON.stringify(newAnswers));
      return newAnswers;
    });
  };

  const handleSubmitAnswers = async () => {
    const confirm = await Swal.fire({
      title: t("confirm_submit_title"),
      text: t("confirm_submit_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("confirm_submit_yes"),
      cancelButtonText: t("confirm_submit_cancel"),
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, label]) => ({
          questionId: Number(questionId),
          label,
        })
      );

      const response = await submitQuizAnswers({
        lessonId: data.lessonId,
        answers: formattedAnswers,
      });

      setResult(response);

      if (response.isPassed) {
        queryClient.invalidateQueries({
          queryKey: ["getTopicsInContentForUser", courseId],
        });
      }

      localStorage.removeItem(localStorageKey);
      setAnswers({});
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: t("submit_error_title"),
        text: t("submit_error_text"),
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = data?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isAnswered = currentQuestion ? !!answers[currentQuestion.id] : false;
  const percent = ((currentIndex + 1) / totalQuestions) * 100;

  const handleTryAgain = () => {
    setCurrentIndex(0);
    setSearchParams({ page: "1" });
    setResult(null);
    window.scrollTo(0, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border rounded-xl border-[#939393] min-h-[400px] shadow-sm bg-white"
    >
      {/* Header */}
      <div className="flex flex-col items-center pb-4">
        <h5 className="text-center text-md font-semibold py-5">
          {t("must_pass")} %{data.requiredScorePercent} {t("of_the_exam")}
        </h5>
        <div className="text-[#FFAA00]">
          {currentIndex + 1}/{totalQuestions}
        </div>
        <div className="mb-5 px-4 flex items-center gap-2 text-sm text-secondary w-[300px] max-sm:w-full">
          <div className="w-full h-[3px] rounded-full bg-[#d4d4d4] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-[#FFAA00]"
            />
          </div>
        </div>
      </div>

      {/* Questions Header */}
      <div className="flex max-md:flex-col items-center justify-between px-10">
        <div>
          <h4 className="font-semibold mb-0">{t("questions")}</h4>
          <TitleLine className={"w-14 -mt-2"} />
        </div>
        <h5 className="text-secondary text-sm mt-2">({t("question_types")})</h5>
      </div>

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 flex flex-col items-center"
        >
          <div className="flex max-md:flex-col max-md:text-center items-center justify-around w-full">
            <div>
              <h4 className="text-lg font-bold mb-4">
                {t("your_score")}: {result.scorePercent}%
              </h4>
              <p className="mb-4">
                {t("pass_percent")}: {result.passPercent}% -{" "}
                {result.isPassed ? t("passed") : t("failed")}
              </p>
            </div>
            {/* Circle Score */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }} // animation أفضل
              className="relative flex items-center justify-center w-28 h-28 mb-4"
            >
              <svg className="w-28 h-28 transform -rotate-90">
                {/* Background Circle */}
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke={result?.isPassed ? "#22c55e" : "#ef4444"}
                  strokeWidth="10"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50}
                  animate={{
                    strokeDashoffset:
                      2 *
                      Math.PI *
                      50 *
                      (1 - (result?.scorePercent ?? 0) / 100),
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.65, 0, 0.35, 1], // ease-in-out cubic for smooth animation
                  }}
                />
              </svg>
              {/* Text */}
              <div className="absolute text-center">
                <h3
                  className={`text-xl font-bold ${
                    result?.isPassed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result?.scorePercent ?? 0}%
                </h3>
              </div>
            </motion.div>
          </div>

          {/* Questions List */}
          <div className="space-y-4 w-full max-w-2xl">
            {result?.questions?.map((q, indx) => {
              const originalQuestion = data.questions.find(
                (question) => question.id === q.questionId
              );
              if (!originalQuestion) return null;

              return (
                <div
                  key={q.questionId}
                  className="border rounded-xl p-4 bg-white shadow-sm"
                >
                  <h5 className="font-bold mb-3">{originalQuestion.title}</h5>

                  <div className="space-y-2">
                    {questions[indx]?.answers?.length === 0 ? (
                      <p className="text-gray-500">
                        لا توجد خيارات لهذا السؤال
                      </p>
                    ) : (
                      questions[indx]?.answers?.map((option) => {
                        const isCorrect = option.label === q.correctLabel;
                        const isWrongSelected =
                          option.label === q.studentLabel && !q.isCorrect;

                        return (
                          <div
                            key={option.label}
                            className={`flex items-center gap-3 p-2 rounded-lg border
                              ${
                                isCorrect ? "bg-green-100 border-green-500" : ""
                              }
                              ${
                                isWrongSelected
                                  ? "bg-red-100 border-red-500"
                                  : ""
                              }
                              ${
                                !isCorrect && !isWrongSelected
                                  ? "bg-gray-100 border-gray-300"
                                  : ""
                              }
                            `}
                          >
                            <input
                              type="radio"
                              disabled
                              checked={isCorrect || isWrongSelected}
                            />
                            <span>
                              {option.label} <span>-</span>
                            </span>

                            <span>{option.title}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="center gap-4 mt-10">
            {/* Try Again Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleTryAgain}
              className="max-sm:text-sm center rounded-lg border border-secondary px-10 py-2 text-secondary cursor-pointer transition disabled:opacity-50"
            >
              {t("try_again")}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <>
          {currentQuestion ? (
            <QuizQuestion
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              selectedAnswer={answers[currentQuestion.id]}
              onSelectAnswer={handleSelectAnswer}
            />
          ) : (
            <p className="text-center text-gray-500 py-10">
              لا توجد أسئلة في هذا الدرس
            </p>
          )}

          {/* Navigation */}
          <div className="center my-12 flex gap-4">
            {currentIndex !== 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="max-sm:text-sm center rounded-lg border border-secondary px-10 py-2 text-secondary cursor-pointer transition disabled:opacity-50"
              >
                {t("back")}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (currentIndex === totalQuestions - 1) {
                  handleSubmitAnswers();
                } else {
                  setCurrentIndex((prev) => prev + 1);
                }
              }}
              disabled={!isAnswered || isSubmitting}
              className="max-sm:text-sm center rounded-lg border border-secondary px-10 py-2 text-secondary cursor-pointer transition disabled:opacity-50"
            >
              {currentIndex === totalQuestions - 1
                ? t("finish_exam")
                : t("next_question")}
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LessonQuestions;
