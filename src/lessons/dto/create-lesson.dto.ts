// src/lessons/dto/create-lesson.dto.ts
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class LessonTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber()
  languageId: number; // إلزامي
}

export class CreateLessonDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  topicId: number; // لازم نحدّد التوبيك

  @IsNumber()
  @IsOptional()
  @Min(0)
  orderId?: number; // يروح لـ order_id (لو مش مبعوت بيتحسب تلقائي)

  @IsString()
  @IsOptional()
  videoLink?: string; // يروح لـ video_link

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsIn([0, 1])
  lessonType?: number; // 0=lesson, 1=questions

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  questionsPercentageScore?: number; // ex: 70

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsIn([0, 1])
  isActive?: number; // 0/1

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LessonTranslationDto)
  translations: LessonTranslationDto[];
}
