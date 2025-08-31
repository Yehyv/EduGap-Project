import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class TopicTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  languageId?: number;
}
export class CreateTopicDto {
  @IsNumber()
  contentId: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => TopicTranslationDto)
  translations: TopicTranslationDto[];
}
