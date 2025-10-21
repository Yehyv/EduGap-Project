import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';

export class TopicTranslationDto {
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

export class CreateTopicDto {
  @IsNumber()
  @IsNotEmpty()
  contentId: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  orderId?: number;

  @IsNumber()
  @IsOptional()
  isActive?: number; // 0/1

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TopicTranslationDto)
  translations: TopicTranslationDto[];
}
