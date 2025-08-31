import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { TopicTranslationDto } from 'src/topics/dto/create-topic.dto';
export class LessonTranslationDto {
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
export class CreateLessonDto {
  @IsNumber()
  topicId: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => LessonTranslationDto)
  translations: TopicTranslationDto[];
}
