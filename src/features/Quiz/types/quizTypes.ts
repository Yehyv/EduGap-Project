export type QuizDetailsType = {
  lessonId: number;
  requiredScorePercent: number;
  questions: QuizQuestion[];
};

export type QuizQuestion = {
  id: number;
  type: boolean;
  title: string;
  answers: QuizAnswer[];
};

export type QuizAnswer = {
  id: number;
  label: string;
  title: string;
  isCorrect?: boolean;
};

export type SumbitQuizType = {
  lessonId: number;
  answers: SubmitAnswersType[];
};

export type SubmitAnswersType = {
  questionId: number;
  label: string;
};
