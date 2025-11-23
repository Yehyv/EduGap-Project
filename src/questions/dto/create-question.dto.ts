import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../entities/question.entity';
import { QuestionAnswerLabel } from '../entities/question-answer.entity';

export class CreateQuestionTranslationDto {
  @IsInt()
  @IsPositive()
  languageId: number;

  @IsNotEmpty()
  title: string;
}

export class CreateQuestionAnswerTranslationDto {
  @IsInt()
  @IsPositive()
  languageId: number;

  @IsNotEmpty()
  title: string;
}

export class CreateQuestionAnswerDto {
  @IsEnum(QuestionAnswerLabel)
  label: QuestionAnswerLabel;

  // مش مهم تحفظها إن كانت صح أو غلط؟
  // لأ مهم عشان نحدد أي واحدة هي الصح
  @IsOptional()
  isCorrect?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionAnswerTranslationDto)
  translations: CreateQuestionAnswerTranslationDto[];
}

export class CreateQuestionDto {
  @IsInt()
  @IsPositive()
  lessonId: number;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionTranslationDto)
  translations: CreateQuestionTranslationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionAnswerDto)
  answers: CreateQuestionAnswerDto[];
}
