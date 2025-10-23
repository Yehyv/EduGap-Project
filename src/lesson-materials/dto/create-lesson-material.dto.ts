// src/lesson-materials/dto/lesson-material-translation.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class LessonMaterialTranslationDto {
  @IsInt()
  languageId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
export class CreateLessonMaterialDto {
  @IsInt()
  lessonId: number;

  @IsInt()
  materialTypeId: number;

  @IsOptional()
  @IsInt()
  contentId?: number;

  @IsOptional()
  @IsString()
  file?: string; // لو بتخزن URL/Key

  @IsOptional()
  @IsIn([0, 1])
  is_active?: number; // default 1

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonMaterialTranslationDto)
  translations: LessonMaterialTranslationDto[];
}