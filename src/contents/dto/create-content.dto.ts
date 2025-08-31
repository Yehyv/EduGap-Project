import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContentTranslationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  languageId?: number;
}
export class CreateContentDto {
  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => ContentTranslationDto)
  translations: ContentTranslationDto[];

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  courseIds: number[];
}
