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
}
