import { IsArray, IsEnum, IsInt, IsPositive } from 'class-validator';
import { QuestionAnswerLabel } from '../entities/question-answer.entity';

export class SubmitQuizAnswerDto {
  @IsInt()
  @IsPositive()
  questionId: number;

  @IsEnum(QuestionAnswerLabel)
  label: QuestionAnswerLabel;
}

export class SubmitQuizDto {
  @IsInt()
  @IsPositive()
  lessonId: number;

  @IsArray()
  answers: SubmitQuizAnswerDto[];
}
