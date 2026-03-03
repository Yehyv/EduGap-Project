import { PartialType, OmitType } from '@nestjs/mapped-types';
import {
  CreateCourseCategoryDto,
  CourseCategoryTranslationDto,
} from './create-course-category.dto';
import {
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCourseCategoryTranslationDto extends PartialType(
  CourseCategoryTranslationDto,
) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  languageId?: number;
}

export class UpdateCourseCategoryDto extends PartialType(
  OmitType(CreateCourseCategoryDto, ['translations'] as const),
) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCourseCategoryTranslationDto)
  translations?: UpdateCourseCategoryTranslationDto[];
}
