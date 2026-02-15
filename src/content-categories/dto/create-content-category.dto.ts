// src/course-categories/dto/create-content-category.dto.ts
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContentCategoryTranslationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}

export class CreateContentCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentCategoryTranslationDto)
  translations: ContentCategoryTranslationDto[];

  @IsOptional()
  @IsIn([0, 1])
  is_active?: number; // default 1
}
