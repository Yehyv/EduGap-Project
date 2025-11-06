import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class LessonMaterialTranslationDto {
  @IsInt()
  @Type(() => Number)
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
  @Type(() => Number)
  lessonId: number;

  @IsInt()
  @Type(() => Number)
  materialTypeId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  contentId?: number;

  @IsOptional()
  @IsString()
  file?: string;

  @IsOptional()
  @IsIn([0, 1])
  @Type(() => Number)
  is_active?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonMaterialTranslationDto)
  @Transform(({ value }): LessonMaterialTranslationDto[] => {
    // لو جت string (من form-data)
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed as LessonMaterialTranslationDto[];
        }
        return [];
      } catch {
        return [];
      }
    }

    // لو جت array فعلاً (من JSON body)
    if (Array.isArray(value)) {
      return value as LessonMaterialTranslationDto[];
    }

    // أي حاجة تانية
    return [];
  })
  translations: LessonMaterialTranslationDto[];
}
