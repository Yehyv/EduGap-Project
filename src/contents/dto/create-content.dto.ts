import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 🟩 Translation DTO
 * يمثل الترجمة الخاصة بالمحتوى (ContentTranslation)
 */
export class ContentTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  // يطابق level_name في الجدول
  @IsString()
  @IsNotEmpty()
  levelName: string;

  // يطابق what_to_learn (هتحوّله join(', ') في السيرفس)
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  whatToLearn?: string[];

  // يطابق previous_background
  @IsString()
  @IsOptional()
  previousBackground?: string;

  // يطابق language_type (اختياري لو عايز تستخدمه)
  @IsEnum(['Arabic', 'English', 'French'])
  @IsOptional()
  languageType?: 'Arabic' | 'English' | 'French';

  // علاقة اللغة الفعلية
  @Type(() => Number)
  @IsNumber()
  languageId: number;
}

/**
 * 🟦 Create Content DTO
 * لإنشاء المحتوى نفسه (Content)
 */
export class CreateContentDto {
  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  @IsOptional()
  level?: 'Beginner' | 'Intermediate' | 'Advanced';

  // يطابق has_prerequiest في الـ entity
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  @IsOptional()
  hasPrerequiest?: 0 | 1;

  // يطابق has_certificate في الـ entity
  @Type(() => Number)
  @IsNumber()
  @IsEnum([0, 1])
  @IsOptional()
  hasCertificate?: 0 | 1;

  @IsString()
  @IsOptional()
  adVideo?: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rate?: number;

  // علاقة التصنيف (ContentCategory)
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  // ترجمات المحتوى
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ContentTranslationDto)
  translations: ContentTranslationDto[];
}

/**
 * 🟨 Update Content DTO
 * لتحديث المحتوى أو ترجماته
 */
// export class UpdateContentDto {
//   @IsString()
//   @IsOptional()
//   image?: string;

//   @IsNumber()
//   @Min(0)
//   @Max(5)
//   @IsOptional()
//   rate?: number;

//   @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
//   @IsOptional()
//   level?: string;

//   @IsNumber()
//   @IsOptional()
//   numberOfReviewers?: number;

//   @IsArray()
//   @IsOptional()
//   @IsNumber({}, { each: true })
//   courseIds?: number[];

//   @IsArray()
//   @IsOptional()
//   @ValidateNested({ each: true })
//   @Type(() => ContentTranslationDto)
//   translations?: ContentTranslationDto[];
// }
