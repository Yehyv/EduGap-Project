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
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContentTranslationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  levelName: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  whatToLearn?: string[];

  @IsString()
  @IsNotEmpty()
  durationTime: string;

  @IsNumber()
  @IsOptional()
  languageId?: number;
}
export class CreateContentDto {
  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => ContentTranslationDto)
  translations: ContentTranslationDto[];

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  courseIds: number[];

  @IsEnum(['Beginner', 'Intermediate', 'Advanced'], {
    message: 'level must be Beginner, Intermediate, or Advanced',
  })
  @IsOptional()
  level?: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  numberOfReviewers?: number;

  @IsNumber()
  categoryId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  educatorIds: number[];
}
