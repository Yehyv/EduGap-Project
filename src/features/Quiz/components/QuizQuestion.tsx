import { motion, AnimatePresence } from "framer-motion";
import ExamIcon from "@/assets/svgs/ExamIcon.svg?react";
import type { QuizQuestion as QuizQuestionType } from "@/features/Quiz/types/quizTypes";
import { useLanguage } from "@/shared/localization/useLanguage";

type Props = {
  question: QuizQuestionType;
  questionNumber: number;
  selectedAnswer?: string;
  onSelectAnswer: (questionId: number, answerLabel: string) => void;
};

const QuizQuestion = ({
  question,
  questionNumber,
  selectedAnswer,
  onSelectAnswer,
}: Props) => {
  const { t } = useLanguage();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -15 }}
        transition={{ duration: 0.3 }}
        className="mx-10 mt-2"
      >
        <h5 className="flex gap-2 font-bold mb-4 items-center">
          <ExamIcon />
          <span>
            {t("question")} {questionNumber}: {question.title}
          </span>
        </h5>

        <div className="space-y-2 px-2">
          {question.answers.map((answer) => {
            const isSelected = selectedAnswer === answer.label;

            return (
              <motion.label
                key={answer.id}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition
                  ${
                    isSelected
                      ? "bg-[#EDF1FF] border border-secondary"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  className="h-4 w-4"
                  checked={isSelected}
                  onChange={() => onSelectAnswer(question.id, answer.label)}
                />
                <span className="text-sm font-medium">{answer.title}</span>
              </motion.label>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizQuestion;
