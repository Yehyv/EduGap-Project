import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateContentTranslationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  levelName?: string;

  @IsString()
  @IsArray({ each: true })
  @IsOptional()
  whatToLearn?: string[];

  @IsString()
  @IsOptional()
  previousBackground?: string;

  @Type(() => Number)
  @IsNumber()
  languageId: number; // المفتاح الوحيد الإجباري
}
export class UpdateContentDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateContentTranslationDto)
  translations?: UpdateContentTranslationDto[];

  @IsNumber()
  @IsOptional()
  rate?: number;

  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  @IsOptional()
  level?: 'Beginner' | 'Intermediate' | 'Advanced';

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  is_ai_content?: number;
}
