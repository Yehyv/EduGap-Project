import { PartialType } from '@nestjs/mapped-types';
import { CreateTopicDto } from './create-topic.dto';
import { TopicTranslation } from '../entities/topic-translation.entity';

export class UpdateTopicTranslation extends PartialType(TopicTranslation) {}
export class UpdateTopicDto extends PartialType(CreateTopicDto) {}
