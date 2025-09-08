import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  Max,
  Min,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
export class CourseTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  levelName: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  whatToLearn?: string[];

  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  image: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationDto)
  translations: CourseTranslationDto[];

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  programIds: number[];

  @IsString()
  @IsNotEmpty()
  durationTime: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  lessonsNumber?: number;

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
}
