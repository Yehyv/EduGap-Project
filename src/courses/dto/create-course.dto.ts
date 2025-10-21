import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
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

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  whatToLearn?: string[];

  @IsString()
  @IsOptional()
  durationTime?: string;

  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationDto)
  translations: CourseTranslationDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  programIds: number[];
}
