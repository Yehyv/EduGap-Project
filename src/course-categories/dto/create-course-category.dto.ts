import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseCategoryTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  languageId: number;
}

export class CreateCourseCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseCategoryTranslationDto)
  translations: CourseCategoryTranslationDto[];

  @IsOptional()
  @IsIn([0, 1])
  isActive?: number;
}
