// src/lessons/dto/update-lesson.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreateLessonDto, LessonTranslationDto } from './create-lesson.dto';

// نخلي كل خصائص الإنشاء اختيارية ماعدا translations هنرجع نضيفها Optional وبنفس النوع
class UpdateLessonBase extends PartialType(
  OmitType(CreateLessonDto, ['translations'] as const),
) {}

export class UpdateLessonDto extends UpdateLessonBase {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonTranslationDto)
  translations?: LessonTranslationDto[];
}
