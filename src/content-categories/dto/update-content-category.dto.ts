// src/course-categories/dto/update-content-category.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import {
  CreateContentCategoryDto,
  ContentCategoryTranslationDto,
} from './create-content-category.dto';
import {
  IsArray,
  IsIn,
  IsOptional,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// عناصر الترجمة للتحديث: كل الحقول اختيارية
export class UpdateContentCategoryTranslationDto extends PartialType(
  ContentCategoryTranslationDto,
) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  languageId?: number;
}

// نخلي Update يرث من Create *بعد* حذف translations من الـ base
export class UpdateContentCategoryDto extends PartialType(
  OmitType(CreateContentCategoryDto, ['translations'] as const),
) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateContentCategoryTranslationDto)
  translations?: UpdateContentCategoryTranslationDto[];

  @IsOptional()
  @IsIn([0, 1])
  is_active?: number;
}
