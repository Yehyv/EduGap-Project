import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContentCategoryTranslationDto {
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
  @Type(() => CreateContentCategoryTranslationDto)
  translations: CreateContentCategoryTranslationDto[];
}
