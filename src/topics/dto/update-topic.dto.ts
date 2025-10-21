import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreateTopicDto, TopicTranslationDto } from './create-topic.dto';

class UpdateTopicBase extends PartialType(
  OmitType(CreateTopicDto, ['translations'] as const),
) {}

export class UpdateTopicDto extends UpdateTopicBase {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TopicTranslationDto)
  translations?: TopicTranslationDto[];
}
